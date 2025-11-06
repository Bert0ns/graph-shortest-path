/*
Example Command:

$env:TS_NODE_COMPILER_OPTIONS='{"module":"commonjs"}';
node -r ts-node/register -r tsconfig-paths/register public/graphs/graph_generator.ts --shape=grid --rows=5 --cols=8 --weighted=true --directed=false --output=public/graphs/grid-40-nodes.json --stdout=false

*/

import type {Graph, GraphEdge, GraphNode} from "@/lib/graph/types";
import {validateGraphFile} from "@/lib/graph/loader";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Options to parameterize graph generation
 */
interface GeneratorOptions {
    shape: "grid" | "cycle" | "complete";
    // grid
    rows: number;
    cols: number;
    // generic counts
    n: number; // used for cycle/complete
    directed: boolean;
    weighted: boolean;
    mirrorUndirected: boolean; // if false and undirected, edges are single-direction entries
    minWeight: number;
    maxWeight: number;
    name?: string;
    description?: string;
}

const MARGIN = 0.01; // keep nodes away from borders a bit

function clampIntoBounds(v: number): number {
    return Math.max(0, Math.min(1, v));
}

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

function withinMarginGridIndex(idx: number, len: number): number {
    if (len <= 1) return 0.5; // single item centered
    const t = idx / (len - 1);
    return clampIntoBounds(lerp(MARGIN, 1 - MARGIN, t));
}

function idFor(index: number): string {
    // Simple readable IDs: N1, N2, ...
    return `N${index + 1}`;
}

function randWeight(minW: number, maxW: number): number {
    const min = Math.min(minW, maxW);
    const max = Math.max(minW, maxW);
    return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

function addEdge(edges: GraphEdge[], from: string, to: string, weight: number, mirror: boolean): void {
    edges.push({from, to, weight});
    if (mirror && from !== to) edges.push({from: to, to: from, weight});
}

function generateGrid(opts: GeneratorOptions): Graph {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    for (let r = 0; r < opts.rows; r++) {
        for (let c = 0; c < opts.cols; c++) {
            const idx = r * opts.cols + c;
            nodes.push({
                id: idFor(idx),
                x: withinMarginGridIndex(c, opts.cols),
                y: withinMarginGridIndex(r, opts.rows)
            });
        }
    }

    const weightOf = () => {
        return opts.weighted ? randWeight(opts.minWeight, opts.maxWeight) : 1;
    };

    const mirror = !opts.directed && opts.mirrorUndirected;

    // horizontal and vertical neighbors
    for (let r = 0; r < opts.rows; r++) {
        for (let c = 0; c < opts.cols; c++) {
            const idx = r * opts.cols + c;
            const from = nodes[idx].id;
            if (c + 1 < opts.cols) {
                const to = nodes[r * opts.cols + (c + 1)].id;
                addEdge(edges, from, to, weightOf(), mirror);
            }
            if (r + 1 < opts.rows) {
                const to = nodes[(r + 1) * opts.cols + c].id;
                addEdge(edges, from, to, weightOf(), mirror);
            }
        }
    }

    const metaName = opts.name ?? `Grid ${opts.rows}x${opts.cols}`;
    const metaDesc = opts.description ?? `Grid graph ${opts.rows}x${opts.cols}${opts.weighted ? " with weights" : " (unweighted)"}${opts.directed ? ", directed" : ", undirected"}`;

    return {
        metadata: {directed: opts.directed, weighted: opts.weighted, name: metaName, description: metaDesc},
        nodes,
        edges,
    };
}

function generateCycle(opts: GeneratorOptions): Graph {
    const n = Math.max(3, Math.floor(opts.n));
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    for (let i = 0; i < n; i++) {
        const angle = (2 * Math.PI * i) / n;
        const x = clampIntoBounds(0.5 + 0.35 * Math.cos(angle));
        const y = clampIntoBounds(0.5 + 0.35 * Math.sin(angle));
        nodes.push({id: idFor(i), x, y});
    }

    const mirror = !opts.directed && opts.mirrorUndirected;

    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const w = opts.weighted ? randWeight(opts.minWeight, opts.maxWeight) : 1;
        addEdge(edges, nodes[i].id, nodes[j].id, w, mirror);
    }

    const metaName = opts.name ?? `Cycle ${n}`;
    const metaDesc = opts.description ?? `Cycle with ${n} nodes${opts.weighted ? " with weights" : " (unweighted)"}${opts.directed ? ", directed" : ", undirected"}`;

    return {
        metadata: {directed: opts.directed, weighted: opts.weighted, name: metaName, description: metaDesc},
        nodes,
        edges
    };
}

function generateComplete(opts: GeneratorOptions): Graph {
    const n = Math.max(2, Math.floor(opts.n));
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    for (let i = 0; i < n; i++) {
        const angle = (2 * Math.PI * i) / n;
        const x = clampIntoBounds(0.5 + 0.38 * Math.cos(angle));
        const y = clampIntoBounds(0.5 + 0.38 * Math.sin(angle));
        nodes.push({id: idFor(i), x, y});
    }

    const mirror = !opts.directed && opts.mirrorUndirected;

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const w = opts.weighted ? randWeight(opts.minWeight, opts.maxWeight) : 1;
            if (opts.directed) {
                edges.push({from: nodes[i].id, to: nodes[j].id, weight: w});
                edges.push({from: nodes[j].id, to: nodes[i].id, weight: w});
            } else {
                addEdge(edges, nodes[i].id, nodes[j].id, w, mirror);
            }
        }
    }

    const metaName = opts.name ?? `Complete ${n}`;
    const metaDesc = opts.description ?? `Complete graph K${n}${opts.weighted ? " with weights" : " (unweighted)"}${opts.directed ? ", directed" : ", undirected"}`;

    return {
        metadata: {directed: opts.directed, weighted: opts.weighted, name: metaName, description: metaDesc},
        nodes,
        edges
    };
}

function parseArgs(argv: string[]): { options: Partial<GeneratorOptions>, output?: string, stdout: boolean } {
    const out: Partial<GeneratorOptions> = {};
    let output: string | undefined;
    let stdout = true;

    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (!a.startsWith("--")) continue;
        const [kRaw, vRaw] = a.slice(2).split("=", 2);
        const k = kRaw.trim();
        const v = (vRaw ?? (i + 1 < argv.length && !argv[i + 1].startsWith("--") ? argv[++i] : "")).trim();

        const toBool = (s: string) => /^(1|true|yes|on)$/i.test(s);
        const toNum = (s: string) => Number(s);

        switch (k) {
            case "shape":
                out.shape = (v as GeneratorOptions["shape"]) || "grid";
                break;
            case "rows":
                out.rows = Math.max(1, Math.floor(toNum(v)));
                break;
            case "cols":
                out.cols = Math.max(1, Math.floor(toNum(v)));
                break;
            case "n":
                out.n = Math.max(2, Math.floor(toNum(v)));
                break;
            case "directed":
                out.directed = toBool(v);
                break;
            case "weighted":
                out.weighted = toBool(v);
                break;
            case "mirrorUndirected":
                out.mirrorUndirected = toBool(v);
                break;
            case "minWeight":
                out.minWeight = toNum(v);
                break;
            case "maxWeight":
                out.maxWeight = toNum(v);
                break;
            case "name":
                out.name = v;
                break;
            case "description":
                out.description = v;
                break;
            case "output":
                output = v;
                stdout = false;
                break;
            case "stdout":
                stdout = toBool(v);
                break;
            default:
                // ignore unknown flags
                break;
        }
    }

    return {options: out, output, stdout};
}

function buildGraph(opts: GeneratorOptions): Graph {
    switch (opts.shape) {
        case "grid":
            return generateGrid(opts);
        case "cycle":
            return generateCycle(opts);
        case "complete":
            return generateComplete(opts);
        default:
            return generateGrid(opts);
    }
}

/**
 * Main function required by the request. Returns a valid Graph following the website schema.
 * Default graph is a small 2x3 weighted undirected grid.
 */
export function graph_generator(): Graph {
    const defaults: GeneratorOptions = {
        shape: "grid",
        rows: 2,
        cols: 3,
        n: 6,
        directed: false,
        weighted: true,
        mirrorUndirected: true,
        minWeight: 1,
        maxWeight: 5,
        name: "Generated Grid 2x3",
        description: "Auto-generated example grid",
    };

    return buildGraph(defaults);
}

function buildHelpText(): string {
    return [
        "Graph Generator CLI",
        "",
        "Usage:",
        "  node -r ts-node/register public/graphs/graph_generator.ts [options]",
        "  npm run graph:gen -- [options]",
        "",
        "Options:",
        "  --shape=grid|cycle|complete         Graph shape to generate (default: grid)",
        "  --rows=<num>                        Number of rows (grid only; default: 2)",
        "  --cols=<num>                        Number of columns (grid only; default: 3)",
        "  --n=<num>                           Number of nodes (cycle/complete; default: 6)",
        "  --directed=true|false               Directed graph (default: false)",
        "  --weighted=true|false               Use random edge weights (true) or unit weights (false) (default: true)",
        "  --mirrorUndirected=true|false       If undirected, also add reverse edges for each edge (default: true)",
        "  --minWeight=<num>                   Minimum random weight (default: 1)",
        "  --maxWeight=<num>                   Maximum random weight (default: 5)",
        "  --name=\"...\"                      Optional graph name",
        "  --description=\"...\"               Optional graph description",
        "  --output=path\\to\\file.json        If provided, save the JSON to this file",
        "  --stdout=true|false                 Also print to stdout (default: true; combine with --output)",
        "  --help, -h, --helpme                Show this help",
        "",
        "Examples:",
        "  # 2x2 grid, unweighted, undirected to stdout",
        "  npm run graph:gen -- --shape=grid --rows=2 --cols=2 --weighted=false --directed=false",
        "",
        "  # 5-node directed, weighted cycle saved to file (no stdout)",
        "  npm run graph:gen -- --shape=cycle --n=5 --weighted=true --directed=true --output=public/graphs/cycle.json --stdout=false",
        "",
        "  # Complete K6, undirected, unit weights to stdout",
        "  npm run graph:gen -- --shape=complete --n=6 --weighted=false --directed=false",
        "",
        "Note: when running directly with node+ts-node on Windows:",
        "  set TS_NODE_COMPILER_OPTIONS={\"module\":\"commonjs\"} && node -r ts-node/register public/graphs/graph_generator.ts --help",
    ].join("\n");
}

async function runCli(): Promise<number> {
    const argv = process.argv.slice(2);

    // Help early exit
    if (argv.includes("--help") || argv.includes("-h") || argv.includes("--helpme")) {
        console.log(buildHelpText());
        return 0;
    }

    const {options: partial, output, stdout} = parseArgs(argv);

    // Defaults that work well
    const defaults: GeneratorOptions = {
        shape: "grid",
        rows: 2,
        cols: 3,
        n: 6,
        directed: false,
        weighted: true,
        mirrorUndirected: true,
        minWeight: 1,
        maxWeight: 5,
        name: undefined,
        description: undefined,
    };

    const opts: GeneratorOptions = {
        ...defaults,
        ...partial,
        // sanitize
        rows: Math.max(1, Math.floor(partial.rows ?? defaults.rows)),
        cols: Math.max(1, Math.floor(partial.cols ?? defaults.cols)),
        n: Math.max(2, Math.floor(partial.n ?? defaults.n)),
        minWeight: Number.isFinite(partial.minWeight as number) ? (partial.minWeight as number) : defaults.minWeight,
        maxWeight: Number.isFinite(partial.maxWeight as number) ? (partial.maxWeight as number) : defaults.maxWeight,
    };

    const graph = buildGraph(opts);

    // Validate with project loader
    const {ok, errors} = validateGraphFile(graph as unknown);
    if (!ok) {
        console.error("Generated graph failed validation:\n- " + errors.join("\n- "));
        return 2;
    }

    const json = JSON.stringify(graph, null, 2);

    // If an output path is provided, always write the file.
    // Optionally also print to stdout if --stdout=true is set.
    if (output) {
        const outPath = path.isAbsolute(output) ? output : path.resolve(process.cwd(), output);
        const dir = path.dirname(outPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
        fs.writeFileSync(outPath, json, {encoding: "utf-8"});
        console.error(`Saved graph JSON to: ${outPath}`);
        if (stdout) {
            console.log(json);
        }
    } else {
        // No output path: print to stdout
        console.log(json);
    }

    return 0;
}

// Run when executed from the command line (best-effort detection, also works with ts-node)
if (typeof process !== "undefined") {
    const entry = process.argv?.[1] || "";
    if (/graph_generator\.(ts|js)$/.test(entry)) {
        runCli().then((code) => process.exit(code)).catch((err) => {
            console.error(err);
            process.exit(1);
        });
    }
}