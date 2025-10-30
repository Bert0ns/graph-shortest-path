import Link from "next/link";
import {websiteConfigs} from "@/website.configs";
import {setCachedGraph} from "@/lib/graph/cache";
import React from "react";
import {Graph} from "@/lib/graph/types";

export interface ExampleGraphCardProps {
    g: Graph,
}

const ExampleGraphCard = ({g}: ExampleGraphCardProps) => {
    const meta = g.metadata.weighted ? (g.metadata.directed ? "Weighted • Directed" : "Weighted • Undirected") : (g.metadata.directed ? "Unweighted • Directed" : "Unweighted • Undirected")

    return (
        <Link href={websiteConfigs.menuItems[1].link}
              onClick={() => setCachedGraph(g)}
              className="group block rounded-md border border-border p-4 hover:border-primary transition-colors bg-card/70">
            <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-foreground group-hover:text-primary">{g.metadata.name}</h3>
                <span className="text-xs text-foreground/60 whitespace-nowrap">{meta}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{g.metadata.description}</p>
        </Link>
    )
}

export default ExampleGraphCard;