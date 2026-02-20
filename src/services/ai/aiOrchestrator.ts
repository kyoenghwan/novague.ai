'use server';

import { Project, ComponentNode, ComponentEdge, AIConfig, ProjectAnalysis } from '@/types';
import { analyzeProject } from './projectManager';
import { analyzeUX, UXFlow } from './uxArchitect';
import { designDataSchema, DataSchema } from './dataArchitect';
import { designComponents, ComponentSpec } from './componentArchitect';

export async function runFullPipeline(idea: string, config: AIConfig): Promise<Project> {
    console.log(`[Pipeline] Starting for idea: ${idea}`);

    // Stage 1: PM Analysis
    const analysis = await analyzeProject(idea, config);
    console.log(`[Pipeline] Stage 1 (PM) complete: ${analysis.identity.projectName}`);

    // Stage 2: UX Design
    const uxFlow = await analyzeUX(analysis, config);
    console.log(`[Pipeline] Stage 2 (UX) complete: ${uxFlow.screens.length} screens`);

    // Stage 3: Data Architecture
    const dataSchema = await designDataSchema(analysis, uxFlow, config);
    console.log(`[Pipeline] Stage 3 (Data) complete: ${dataSchema.tables.length} tables`);

    // Stage 4: Component SDD
    const componentSpec = await designComponents(analysis, uxFlow, dataSchema, config);
    console.log(`[Pipeline] Stage 4 (Component) complete: ${componentSpec.components.length} components`);

    // Final Assembly: Convert all stages into a Project object (Nodes & Edges)
    return assembleProject(analysis, uxFlow, dataSchema, componentSpec);
}

function assembleProject(
    analysis: ProjectAnalysis,
    uxFlow: UXFlow,
    dataSchema: DataSchema,
    compSpec: ComponentSpec
): Project {
    const nodes: ComponentNode[] = [];
    const edges: ComponentEdge[] = [];

    // 1. Create Screen Nodes
    uxFlow.screens.forEach((screen, idx) => {
        nodes.push({
            id: screen.id,
            type: 'custom',
            position: { x: 100 + (idx * 250), y: 100 },
            data: {
                label: screen.name,
                type: 'page',
                description: screen.description,
                requirements: [],
                techSpec: {
                    framework: analysis.technical.recommendedTechStack.frontend,
                    styling: 'Tailwind CSS', // Default as it's not explicitly in new structure
                    stateManagement: 'Zustand' // Default as it's not explicitly in new structure
                },
                filePath: `/src/pages/${screen.name}.tsx`,
            }
        });
    });

    // 2. Create Navigation Edges
    uxFlow.flows.forEach(flow => {
        edges.push({
            id: `e-${flow.from}-${flow.to}`,
            source: flow.from,
            target: flow.to,
            label: flow.action,
            type: 'navigation',
            markerEnd: { type: 'arrowclosed' } as any
        });
    });

    // 3. Create Database Nodes
    dataSchema.tables.forEach((table, idx) => {
        const tableId = `db-${table.name}`;
        nodes.push({
            id: tableId,
            type: 'custom',
            position: { x: 100 + (idx * 250), y: 600 },
            data: {
                label: table.name,
                type: 'database',
                description: table.description,
                requirements: [],
                tableSchema: {
                    name: table.name,
                    description: table.description,
                    fields: table.columns.map(c => ({
                        name: c.name,
                        type: c.type,
                        constraints: c.constraints,
                        description: ''
                    })),
                    primaryKey: 'id',
                    foreignKeys: []
                },
                techSpec: { framework: '', styling: '', stateManagement: '' },
                filePath: `Database Table: ${table.name}`
            }
        });
    });

    // 4. Create Component Nodes & Map to Screens
    compSpec.components.forEach((comp, idx) => {
        const compId = comp.id;
        nodes.push({
            id: compId,
            type: 'custom',
            position: { x: 100 + (idx * 200), y: 350 },
            data: {
                label: comp.name,
                type: 'component',
                description: comp.description,
                requirements: [],
                interfaces: {
                    props: comp.props.map(p => ({ ...p, required: true })),
                    state: comp.state.map(s => ({ ...s, description: '' })),
                    events: []
                },
                techSpec: { framework: 'React', styling: 'Tailwind', stateManagement: 'None' },
                filePath: `/src/components/${comp.name}.tsx`
            }
        });

        // Link Component to its Screen
        edges.push({
            id: `e-${compId}-${comp.screenId}`,
            source: compId,
            target: comp.screenId,
            type: 'dependency',
            markerEnd: { type: 'arrowclosed' } as any
        });

        // Link Component to used Endpoints (Simplified: link to relevant DB tables)
        comp.usedEndpoints.forEach(endpointPath => {
            // Logic to find related table could be added here
        });
    });

    return {
        id: crypto.randomUUID(),
        name: analysis.identity.projectName,
        description: analysis.identity.oneLiner,
        techStack: [analysis.technical.recommendedTechStack.frontend, analysis.technical.recommendedTechStack.backend],
        nodes,
        edges,
        createdAt: Date.now(),
        updatedAt: new Date(),
    };
}
