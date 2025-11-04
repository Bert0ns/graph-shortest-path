import {TraceEvent} from '../types';

export interface VisualizationState {
    nodes: {
        [nodeId: string]: {
            isVisited?: boolean;
            isPath?: boolean;
            distance?: number;
        };
    };
    edges: {
        [edgeId: string]: {
            isPath?: boolean;
        };
    };
    frontier: string[];
    currentNodeId: string | null;
    relaxedEdgeId: string | null;
    done: boolean;
}

export class TraceStepper {
    public state: VisualizationState;
    private readonly log: TraceEvent[];
    private step = 0;

    constructor(log: TraceEvent[]) {
        this.log = log;
        this.state = this.getInitialState();
    }

    public reset(): void {
        this.step = 0;
        this.state = this.getInitialState();
    }

    public next(): void {
        if (this.state.done) {
            return;
        }

        const event = this.log[this.step];
        if (!event) {
            this.state = {...this.state, done: true};
            return;
        }

        this.state = this.processEvent(event);
        this.step++;

        if (this.step >= this.log.length) {
            this.state = {...this.state, done: true};
        }
    }

    public goToEndingState(): VisualizationState {
        this.step = this.log.length - 1;
        const e = this.processEvent(this.log[this.step]);
        this.state = {...e, done: true};
        return this.state;
    }

    private processEvent(event: TraceEvent): VisualizationState {
        const prevState = this.state;

        switch (event.type) {
            case 'visit':
                return {
                    ...prevState,
                    currentNodeId: event.nodeId,
                    relaxedEdgeId: null,
                    nodes: {
                        ...prevState.nodes,
                        [event.nodeId]: {
                            ...prevState.nodes[event.nodeId],
                            isVisited: true,
                            distance: event.distance,
                        },
                    },
                    frontier: prevState.frontier.filter(id => id !== event.nodeId),
                };

            case 'relax':
                return {
                    ...prevState,
                    currentNodeId: null,
                    relaxedEdgeId: `${event.fromId}-${event.toId}`,
                    nodes: {
                        ...prevState.nodes,
                        [event.toId]: {
                            ...prevState.nodes[event.toId],
                            distance: event.newDistance,
                        },
                    },
                    frontier: prevState.nodes[event.toId]?.isVisited || prevState.frontier.includes(event.toId)
                        ? prevState.frontier
                        : [...prevState.frontier, event.toId],
                };

            case 'finish':
                const newNodes = {...prevState.nodes};
                const newEdges = {...prevState.edges};
                for (let i = 0; i < event.path.length - 1; i++) {
                    const from = event.path[i];
                    const to = event.path[i + 1];
                    newEdges[`${from}-${to}`] = {isPath: true};
                    newNodes[from] = {...newNodes[from], isPath: true};
                    newNodes[to] = {...newNodes[to], isPath: true};
                }
                return {
                    ...prevState,
                    currentNodeId: null,
                    relaxedEdgeId: null,
                    frontier: [],
                    nodes: newNodes,
                    edges: newEdges,
                };
        }
    }

    private getInitialState(): VisualizationState {
        return {
            nodes: {},
            edges: {},
            frontier: [],
            currentNodeId: null,
            relaxedEdgeId: null,
            done: false,
        };
    }
}