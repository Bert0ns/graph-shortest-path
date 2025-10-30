
export const examples = [
    {
        href: '/simulator?graph=/graphs/sample.json',
        title: 'Sample graph',
        description: 'Balanced example with weights, great to explore the UI',
        meta: 'Undirected • Weighted',
    },
    {
        href: '/simulator?graph=/graphs/triangle-unweighted.json',
        title: 'Triangle (Unweighted)',
        description: 'Minimal undirected triangle; weights treated as 1',
        meta: 'Undirected • Unweighted',
    },
    {
        href: '/simulator?graph=/graphs/square-weighted-directed.json',
        title: 'Square (Directed, Weighted)',
        description: '4-node cycle with a diagonal shortcut and custom weights',
        meta: 'Directed • Weighted',
    },
    {
        href: '/simulator?graph=/graphs/grid-6-nodes.json',
        title: 'Grid 2×3 (Weighted)',
        description: 'Small grid with varying weights',
        meta: 'Undirected • Weighted',
    },
    {
        href: '/simulator?graph=/graphs/tree-7-nodes.json',
        title: 'Binary Tree (Directed)',
        description: 'Simple 7-node binary tree, directed from root to leaves',
        meta: 'Directed • Unweighted',
    },
]