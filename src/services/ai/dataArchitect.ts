import { AIConfig, ProjectAnalysis } from '@/types';
import { UXFlow } from './uxArchitect';
import { generateAIObject } from '@/services/ai/aiService';
import { z } from 'zod';

export const SchemaDefinition = z.object({
    tables: z.array(z.object({
        name: z.string(),
        description: z.string(),
        columns: z.array(z.object({
            name: z.string(),
            type: z.string(),
            constraints: z.array(z.string()),
        })),
    })),
    endpoints: z.array(z.object({
        method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
        path: z.string(),
        description: z.string(),
        requestBody: z.any().optional(),
        responseBody: z.any().optional(),
    })),
});

export type DataSchema = z.infer<typeof SchemaDefinition>;

export async function designDataSchema(analysis: ProjectAnalysis, uxFlow: UXFlow, config: AIConfig) {
    const prompt = `
        Data Architect AI.
        Project: ${analysis.identity.projectName}
        Business Rules: ${analysis.businessLogic.interactionRules.followingModel}, ${analysis.businessLogic.contentPolicy.visibility}
        Screens: ${uxFlow.screens.map(s => s.name).join(', ')}
        Flows: ${uxFlow.flows.map(f => `${f.from} -> ${f.to} (${f.action})`).join(', ')}
        
        Design a robust database schema and REST API endpoints to support this UX flow.
        Focus on RLS security if Supabase is used (${analysis.technical.recommendedTechStack.database}).
    `;
    return await generateAIObject(config, prompt, SchemaDefinition, 'Data Architect');
}
