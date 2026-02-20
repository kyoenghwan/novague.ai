import { AIConfig, ProjectAnalysis } from '@/types';
import { UXFlow } from './uxArchitect';
import { DataSchema } from './dataArchitect';
import { generateAIObject } from '@/services/ai/aiService';
import { z } from 'zod';

export const ComponentSpecSchema = z.object({
    components: z.array(z.object({
        id: z.string(),
        name: z.string(),
        screenId: z.string(),
        description: z.string(),
        props: z.array(z.object({
            name: z.string(),
            type: z.string(),
            description: z.string(),
        })),
        state: z.array(z.object({
            name: z.string(),
            type: z.string(),
            initialValue: z.string(),
        })),
        usedEndpoints: z.array(z.string()),
    })),
});

export type ComponentSpec = z.infer<typeof ComponentSpecSchema>;

export async function designComponents(
    analysis: ProjectAnalysis,
    uxFlow: UXFlow,
    dataSchema: DataSchema,
    config: AIConfig
) {
    const prompt = `
        Component Architect AI.
        Project: ${analysis.identity.projectName}
        Screens: ${JSON.stringify(uxFlow.screens)}
        Data Schema: ${JSON.stringify(dataSchema.tables)}
        API Endpoints: ${JSON.stringify(dataSchema.endpoints)}
        
        Decompose each screen into modular React components.
        Define the SDD (Software Design Document) for each component, including Props, State, and which API endpoints it interacts with.
    `;
    return await generateAIObject(config, prompt, ComponentSpecSchema, 'Component Architect');
}
