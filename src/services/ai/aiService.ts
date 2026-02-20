'use server';

import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject, generateText } from 'ai';
import { AIConfig } from '@/types/index';
import { z } from 'zod';

function getModel(config: AIConfig) {
    if (!config?.apiKey) {
        throw new Error("API Key is missing via config");
    }

    switch (config.provider) {
        case 'openai':
            const openai = createOpenAI({ apiKey: config.apiKey });
            return openai(config.model);
        case 'anthropic':
            const anthropic = createAnthropic({ apiKey: config.apiKey });
            return anthropic(config.model);
        case 'google':
            const google = createGoogleGenerativeAI({ apiKey: config.apiKey });
            return google(config.model);
        default:
            throw new Error(`Unsupported provider: ${config.provider}`);
    }
}

export async function generateAIObject<T>(
    config: AIConfig,
    prompt: string,
    schema: z.ZodSchema<T>,
    schemaName: string,
    stage?: string,
    userId?: string
): Promise<T> {
    try {
        const model = getModel(config);

        const result = await generateObject({
            model: model,
            schema: schema,
            prompt: prompt,
            temperature: config.temperature || 0.7,
            maxTokens: config.maxTokens || 4000,
        });

        if (result.usage) {
            logAIUsage(config, result.usage, stage || schemaName, userId);
        }

        return result.object;
    } catch (error) {
        console.error(`AI Generation Failed (${schemaName}):`, error);
        throw error;
    }
}

async function logAIUsage(config: AIConfig, usage: any, stage?: string, userId?: string) {
    try {
        const { supabase } = require('@/services/supabase-client');

        let targetUserId = userId;

        if (!targetUserId) {
            const { data: { user } } = await supabase.auth.getUser();
            targetUserId = user?.id;
        }

        if (!targetUserId) return;

        await supabase.from('ai_usage').insert({
            user_id: targetUserId,
            provider: config.provider,
            model: config.model,
            prompt_tokens: usage.promptTokens || 0,
            completion_tokens: usage.completionTokens || 0,
            total_tokens: usage.totalTokens || 0,
            stage: stage || 'unknown'
        });
    } catch (err) {
        console.error("Failed to log AI usage:", err);
    }
}

export async function generateAIText(
    config: AIConfig,
    prompt: string,
    stage?: string,
    userId?: string
): Promise<string> {
    try {
        const model = getModel(config);

        const result = await generateText({
            model: model,
            prompt: prompt,
            temperature: config.temperature || 0.7,
            maxOutputTokens: config.maxTokens || 4000,
        });

        if (result.usage) {
            logAIUsage(config, result.usage, stage, userId);
        }

        return result.text;
    } catch (error) {
        console.error("AI Text Generation Failed:", error);
        throw error;
    }
}
