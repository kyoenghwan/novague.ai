import { Node, Edge, MarkerType } from 'reactflow';
import { ProjectAnalysis, ScreenAnalysis, DataArchitecture, ComponentArchitecture, Component } from '@/types';

export type ViewMode = 'architecture' | 'userFlow' | 'component' | 'dataFlow' | 'dependency';

interface VisualizationData {
    nodes: Node[];
    edges: Edge[];
}

export function generateVisualization(
    mode: ViewMode,
    project: ProjectAnalysis,
    ux: ScreenAnalysis,
    data: DataArchitecture,
    components: ComponentArchitecture
): VisualizationData {
    switch (mode) {
        case 'architecture':
            return generateArchitectureView(project, data);
        case 'userFlow':
            return generateUserFlowView(ux);
        case 'component':
            return generateComponentTreeView(components);
        case 'dataFlow':
            return generateDataFlowView(data, components);
        case 'dependency':
            return generateDependencyGraphView(components);
        default:
            return { nodes: [], edges: [] };
    }
}

// 1. Architecture View (High-level System Design)
function generateArchitectureView(project: ProjectAnalysis, data: DataArchitecture): VisualizationData {
    const nodes: Node[] = [
        {
            id: 'client',
            type: 'default',
            data: { label: `${project.techStack.frontend.framework} Client` },
            position: { x: 250, y: 50 },
            style: { border: '2px solid #3b82f6', fontWeight: 'bold' }
        },
        {
            id: 'backend',
            type: 'default',
            data: { label: `${project.techStack.backend.platform} API` },
            position: { x: 250, y: 200 },
            style: { border: '2px solid #8b5cf6', fontWeight: 'bold' }
        },
        {
            id: 'database',
            type: 'database', // Using custom type if avail, else default handles it
            data: { label: `${project.techStack.backend.database} DB` },
            position: { x: 250, y: 350 },
            style: { border: '2px solid #10b981', fontWeight: 'bold' }
        }
    ];

    const edges: Edge[] = [
        { id: 'c-b', source: 'client', target: 'backend', animated: true, label: 'REST/GraphQL', style: { stroke: '#3b82f6' } },
        { id: 'b-d', source: 'backend', target: 'database', animated: true, label: 'ORM', style: { stroke: '#8b5cf6' } }
    ];

    // Add Auth/Ext services if present
    if (project.techStack.backend.authentication) {
        nodes.push({
            id: 'auth',
            type: 'default', // default
            data: { label: project.techStack.backend.authentication },
            position: { x: 50, y: 200 },
            style: { border: '2px solid #f59e0b' }
        });
        edges.push({ id: 'c-a', source: 'client', target: 'auth', style: { strokeDasharray: '5,5' } });
        edges.push({ id: 'b-a', source: 'backend', target: 'auth', style: { strokeDasharray: '5,5' } });
    }

    return { nodes, edges };
}

// 2. User Flow View (Screen Navigation)
function generateUserFlowView(ux: ScreenAnalysis): VisualizationData {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let x = 0;
    let y = 0;

    ux.screens.forEach((screen, index) => {
        nodes.push({
            id: screen.id,
            type: 'default',
            data: { label: screen.name },
            position: { x: (index % 3) * 200 + 50, y: Math.floor(index / 3) * 150 + 50 },
            style: { backgroundColor: '#eff6ff', border: '1px solid #2563eb' }
        });
    });

    ux.userFlows.forEach((flow, flowIndex) => {
        flow.steps.forEach((step, stepIndex) => {
            // Link screen to next screen
            if (step.nextScreen && step.nextScreen !== 'terminate') {
                // Try to resolve screen IDs (simplified matching)
                const sourceId = ux.screens.find(s => s.name === step.screen || s.id === step.screen)?.id;
                const targetId = ux.screens.find(s => s.name === step.nextScreen || s.id === step.nextScreen)?.id;

                if (sourceId && targetId) {
                    edges.push({
                        id: `flow-${flowIndex}-${stepIndex}`,
                        source: sourceId,
                        target: targetId,
                        label: step.action,
                        markerEnd: { type: MarkerType.ArrowClosed },
                        animated: true
                    });
                }
            }
        });
    });

    return { nodes, edges };
}

// 3. Component Tree View
function generateComponentTreeView(components: ComponentArchitecture): VisualizationData {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    let pageX = 0;

    components.screens.forEach((screen, sIdx) => {
        const screenNodeId = `screen-${screen.screenId}`;
        nodes.push({
            id: screenNodeId,
            type: 'input',
            data: { label: `${screen.screenId} Page` },
            position: { x: pageX, y: 0 },
            style: { fontWeight: 'bold', backgroundColor: '#f3f4f6' }
        });

        const layoutId = `layout-${screen.screenId}`;
        nodes.push({
            id: layoutId,
            data: { label: screen.layout.name },
            position: { x: pageX, y: 100 },
        });
        edges.push({ id: `s-l-${screen.screenId}`, source: screenNodeId, target: layoutId });

        // Features under layout
        screen.featComponents.forEach((comp, cIdx) => {
            const compId = `comp-${comp.id}`;
            nodes.push({
                id: compId,
                data: { label: comp.name },
                position: { x: pageX + (cIdx * 150) - 50, y: 250 },
                style: { backgroundColor: '#fdf4ff', border: '1px solid #c026d3' } // Purple for features
            });
            edges.push({ id: `l-c-${comp.id}`, source: layoutId, target: compId });
        });

        pageX += 400; // Space between screen trees
    });

    return { nodes, edges };
}

// 4. Data Flow View (State -> API -> DB)
function generateDataFlowView(data: DataArchitecture, components: ComponentArchitecture): VisualizationData {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let y = 50;

    // Database Tables (Bottom Layer)
    data.database.tables.forEach((table, idx) => {
        nodes.push({
            id: `tbl-${table.name}`,
            type: 'output',
            data: { label: `Table: ${table.name}` },
            position: { x: idx * 250, y: 400 },
            style: { backgroundColor: '#ecfdf5', borderColor: '#059669' }
        });
    });

    // APIs (Middle Layer)
    data.apis.forEach((api, idx) => {
        const apiId = `api-${api.method}-${api.path}`;
        nodes.push({
            id: apiId,
            data: { label: `${api.method} ${api.path}` },
            position: { x: idx * 220, y: 250 },
            style: { backgroundColor: '#fff7ed', borderColor: '#ea580c' }
        });

        // Link API to Tables
        api.relatedTables.forEach(relatedTbl => {
            // Find table node
            const targetTbl = data.database.tables.find(t => t.name === relatedTbl);
            if (targetTbl) {
                edges.push({
                    id: `api-tbl-${api.path}-${targetTbl.name}`,
                    source: apiId,
                    target: `tbl-${targetTbl.name}`,
                    style: { strokeDasharray: '5,5' },
                    animated: true
                });
            }
        });
    });

    // Components (Top Layer - only features that call APIs)
    let compX = 0;
    components.screens.forEach(screen => {
        screen.featComponents.forEach(comp => {
            if (comp.dependencies.apis.length > 0) {
                const compId = `df-comp-${comp.id}`;
                nodes.push({
                    id: compId,
                    type: 'input',
                    data: { label: comp.name },
                    position: { x: compX, y: 50 },
                    style: { backgroundColor: '#eff6ff', borderColor: '#2563eb' }
                });
                compX += 200;

                // Link Component to API
                comp.dependencies.apis.forEach(apiPath => {
                    // Find API Node (simplified matching)
                    const targetApi = data.apis.find(a => apiPath.includes(a.path) || a.path.includes(apiPath));
                    if (targetApi) {
                        const targetApiId = `api-${targetApi.method}-${targetApi.path}`;
                        edges.push({
                            id: `comp-api-${comp.id}`,
                            source: compId,
                            target: targetApiId,
                            markerEnd: { type: MarkerType.ArrowClosed }
                        });
                    }
                });
            }
        });
    });

    return { nodes, edges };
}

// 5. Dependency Graph
function generateDependencyGraphView(components: ComponentArchitecture): VisualizationData {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const visited = new Set<string>();

    // Collect all components (flat list)
    const allComponents: Component[] = [
        ...components.screens.flatMap(s => s.featComponents),
        ...components.screens.flatMap(s => s.uiComponents),
        ...components.sharedComponents
    ];

    allComponents.forEach((comp, idx) => {
        if (!visited.has(comp.name)) {
            nodes.push({
                id: comp.name, // Use name as ID for easier linking locally
                data: { label: comp.name },
                position: { x: (idx % 5) * 200, y: Math.floor(idx / 5) * 150 },
                style: {
                    backgroundColor: comp.type === 'ui' ? '#eff6ff' : '#fdf4ff',
                    borderColor: comp.type === 'ui' ? '#2563eb' : '#c026d3'
                }
            });
            visited.add(comp.name);
        }
    });

    // Create edges based on dependencies
    allComponents.forEach(comp => {
        comp.dependencies.components.forEach(depName => {
            if (visited.has(depName)) {
                edges.push({
                    id: `dep-${comp.name}-${depName}`,
                    source: comp.name,
                    target: depName,
                    markerEnd: { type: MarkerType.ArrowClosed },
                    style: { stroke: '#94a3b8' }
                });
            }
        });
    });

    return { nodes, edges };
}
