import { AIConfig, ProjectAnalysis } from '@/types';
import { generateAIObject } from '@/services/ai/aiService';
import { z } from 'zod';

export const UXFlowSchema = z.object({
    screens: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        type: z.enum(['page', 'modal', 'drawer', 'sidebar']),
    })),
    flows: z.array(z.object({
        from: z.string(),
        to: z.string(),
        action: z.string(),
        description: z.string(),
    })),
    backgroundProcesses: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        type: z.enum(['cron', 'webhook', 'worker']),
        trigger: z.string(),
    })),
});

export type UXFlow = z.infer<typeof UXFlowSchema>;

export async function analyzeUX(analysis: ProjectAnalysis, config: AIConfig) {
    const prompt = `
        UX Architect AI. 
        Project: ${analysis.identity.projectName}
        Type: ${analysis.technical.platform.type}
        Stack: ${JSON.stringify(analysis.technical.recommendedTechStack)}
        Differentiators: ${analysis.identity.differentiators.join(', ')}
        
        Based on these requirements, design a comprehensive user flow and screen map.
        Identify all necessary screens and how they connect.
    `;
    return await generateAIObject(config, prompt, UXFlowSchema, 'UX Architect');
}
