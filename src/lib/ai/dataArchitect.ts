'use server';

import { ProjectAnalysis, ScreenAnalysis, DataArchitecture, DatabaseTable, APIEndpoint, AIConfig } from '@/types';
import { generateAIObject } from '@/lib/ai/aiService';
import { z } from 'zod';

// --- Zod Schemas ---

const DatabaseTableSchema = z.object({
    name: z.string(),
    description: z.string(),
    fields: z.array(z.object({
        name: z.string(),
        type: z.string(),
        constraints: z.array(z.string()),
        defaultValue: z.any().optional(),
        description: z.string()
    })),
    primaryKey: z.string(),
    foreignKeys: z.array(z.string())
});

const APIEndpointSchema = z.object({
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    path: z.string(),
    description: z.string(),
    authentication: z.boolean(),
    authorization: z.array(z.string()),
    request: z.object({
        headers: z.record(z.string(), z.any()).optional(),

        params: z.record(z.string(), z.any()).optional(),

        body: z.record(z.string(), z.any()).optional()

    }),
    response: z.object({
        success: z.record(z.string(), z.any()),

        errors: z.array(z.record(z.string(), z.any())).default([])

    }),
    businessLogic: z.array(z.string()),
    relatedTables: z.array(z.string()),
    usedByScreens: z.array(z.string())
});

const DataFlowSchema = z.object({
    id: z.string(),
    name: z.string(),
    source: z.string(),
    destination: z.string(),
    dataType: z.string(),
    transformations: z.array(z.string())
});

const DataArchitectureSchema = z.object({
    database: z.object({
        tables: z.array(DatabaseTableSchema),
        relationships: z.array(z.any()),
        indexes: z.array(z.any()),
        policies: z.array(z.string())
    }),
    apis: z.array(APIEndpointSchema),
    dataFlows: z.array(DataFlowSchema)
});

/**
 * 프로젝트 및 UX 분석 결과를 바탕으로 데이터베이스 및 API 설계를 수행하는 AI 엔진
 */
export async function analyzeData(project: ProjectAnalysis, ux: ScreenAnalysis, config?: AIConfig | null): Promise<DataArchitecture> {

    if (config?.apiKey) {
        try {
            const prompt = `
            Design the Data Architecture (Database and APIs) based on the project requirements and UX flow.
            
            Project: ${project.projectName}
            Tech Stack: ${project.techStack.backend.database}
            User Flows: ${JSON.stringify(ux.userFlows.map(f => f.name))}
            Screens: ${JSON.stringify(ux.screens.map(s => s.name))}

            Requirements:
            1. Design database tables with fields, types, and constraints (PostgreSQL compatible).
            2. Design REST API endpoints required for the screens and flows.
            3. Define RLS policies for security.
            `;

            return await generateAIObject(config, prompt, DataArchitectureSchema, 'Data Architecture Analysis');
        } catch (error) {
            console.error("AI Data Analysis failed, falling back to mock:", error);
        }
    }

    // --- Mock Implementation (Fallback) ---
    // 1. Simulation Delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    const tables: DatabaseTable[] = [];
    const apis: APIEndpoint[] = [];
    const policies: string[] = [];

    // 2. Mock Logic

    // Core Tables: Users are always needed
    tables.push({
        name: 'users',
        description: 'Stores user account information',
        fields: [
            { name: 'id', type: 'uuid', constraints: ['PK', 'default: uuid_generate_v4()'], description: 'Unique identifier' },
            { name: 'email', type: 'varchar', constraints: ['unique', 'not null'], description: 'User email address' },
            { name: 'username', type: 'varchar', constraints: ['unique'], description: 'Display name' },
            { name: 'avatar_url', type: 'text', constraints: [], description: 'Profile picture URL' },
            { name: 'created_at', type: 'timestamp', constraints: ['default: now()'], description: 'Account creation time' }
        ],
        primaryKey: 'id',
        foreignKeys: []
    });
    policies.push('users: User can only update their own profile');
    policies.push('users: Public read access for basic info');

    // Content Tables based on project type
    if (project.coreFeatures.some(f => f.includes('Post') || f.includes('Feed'))) {
        tables.push({
            name: 'posts',
            description: 'User generated posts',
            fields: [
                { name: 'id', type: 'uuid', constraints: ['PK', 'default: uuid_generate_v4()'], description: 'Post ID' },
                { name: 'user_id', type: 'uuid', constraints: ['FK: users.id', 'not null'], description: 'Author ID' },
                { name: 'content', type: 'text', constraints: [], description: 'Text content' },
                { name: 'media_url', type: 'text', constraints: [], description: 'Image/Video URL' },
                { name: 'created_at', type: 'timestamp', constraints: ['default: now()'], description: 'Creation time' }
            ],
            primaryKey: 'id',
            foreignKeys: ['user_id']
        });
        policies.push('posts: Public read access');
        policies.push('posts: Authenticated create access');
        policies.push('posts: Author delete access');

        // CRUD APIs for Posts
        apis.push(createApi('GET', '/posts', 'List posts with pagination', false));
        apis.push(createApi('POST', '/posts', 'Create a new post', true));
        apis.push(createApi('GET', '/posts/:id', 'Get detailed post info', false));
        apis.push(createApi('DELETE', '/posts/:id', 'Delete a post', true));
    }

    if (project.coreFeatures.some(f => f.includes('Shop') || f.includes('Product'))) {
        tables.push({
            name: 'products',
            description: 'Product catalog',
            fields: [
                { name: 'id', type: 'uuid', constraints: ['PK'], description: 'Product ID' },
                { name: 'name', type: 'varchar', constraints: ['not null'], description: 'Product Name' },
                { name: 'price', type: 'decimal', constraints: ['not null'], description: 'Price' },
                { name: 'stock', type: 'integer', constraints: ['default: 0'], description: 'Inventory count' }
            ],
            primaryKey: 'id',
            foreignKeys: []
        });

        apis.push(createApi('GET', '/products', 'List all products', false));
        apis.push(createApi('GET', '/products/:id', 'Get product detail', false));
    }

    // Default System APIs
    apis.push(createApi('GET', '/auth/me', 'Get current user session', true));
    apis.push(createApi('POST', '/auth/login', 'User login', false));

    return {
        database: {
            tables,
            relationships: [],
            indexes: [],
            policies
        },
        apis,
        dataFlows: []
    };
}

function createApi(method: APIEndpoint['method'], path: string, desc: string, auth: boolean): APIEndpoint {
    return {
        method,
        path,
        description: desc,
        authentication: auth,
        authorization: auth ? ['user'] : [],
        request: {},
        response: { success: {}, errors: [] },
        businessLogic: [],
        relatedTables: [],
        usedByScreens: []
    };
}
