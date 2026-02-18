'use server';

import { ProjectAnalysis, AIConfig } from '@/types';
import { generateAIObject } from '@/lib/ai/aiService';
import { z } from 'zod';

// Define Zod schemas matching the types
const UserRoleSchema = z.object({
    name: z.string(),
    permissions: z.array(z.string()),
    description: z.string(),
});

const TechStackSchema = z.object({
    frontend: z.object({
        framework: z.string(),
        language: z.string(),
        styling: z.string(),
        stateManagement: z.string(),
    }),
    backend: z.object({
        type: z.enum(['serverless', 'traditional', 'microservices']),
        platform: z.string(),
        database: z.string(),
        authentication: z.string(),
    }),
    deployment: z.object({
        frontend: z.string(),
        backend: z.string(),
        cdn: z.string(),
    }),
});

const AnalysisReasoningSchema = z.object({
    techStackReason: z.string(),
    architectureReason: z.string(),
    complexityReason: z.string(),
});

const ProjectAnalysisSchema = z.object({
    projectName: z.string(),
    summary: z.string(),
    projectType: z.enum(['web', 'mobile', 'desktop', 'api', 'hybrid']),
    techStack: TechStackSchema,
    coreFeatures: z.array(z.string()),
    userRoles: z.array(UserRoleSchema),
    businessRules: z.array(z.string()),
    estimatedComplexity: z.enum(['simple', 'medium', 'complex']),
    developmentTime: z.string(),
    teamSize: z.string(),
    reasoning: AnalysisReasoningSchema,
});

/**
 * 프로젝트 아이디어를 분석하여 기술 스택과 기능을 제안하는 AI 엔진
 */
export async function analyzeProject(idea: string, config?: AIConfig | null): Promise<ProjectAnalysis> {
    // 1. AI 설정이 있고 API Key가 존재하면 실제 AI 호출
    if (config?.apiKey) {
        try {
            const prompt = `
            Analyze the following project idea and propose a technical architecture.
            Idea: "${idea}"

            Provide a comprehensive analysis including:
            1. Project Name (Creative and relevant)
            2. Summary
            3. Project Type (web, mobile, etc.)
            4. Recommended Tech Stack (Modern, Best Practices)
            5. Core Features (List of key functionalities)
            6. User Roles
            7. Business Rules
            8. Complexity Estimation
            9. Reasoning for choices
            `;

            return await generateAIObject(config, prompt, ProjectAnalysisSchema, 'Project Analysis');
        } catch (error) {
            console.error("AI Analysis failed, falling back to mock:", error);
            // Fallback to mock if AI fails
        }
    }

    // --- Mock Implementation (Fallback) ---
    // 1. 시뮬레이션 딜레이
    await new Promise(resolve => setTimeout(resolve, 2000));

    const lowerIdea = idea.toLowerCase();

    // 2. 간단한 키워드 기반 로직 (MVP용)
    let projectType: ProjectAnalysis['projectType'] = 'web';
    let frontendFramework = 'Next.js 14';
    let styling = 'Tailwind CSS';
    let database = 'PostgreSQL';
    let auth = 'Supabase Auth';
    let summary = '사용자의 아이디어를 바탕으로 설계된 웹 애플리케이션입니다.';

    // 키워드 분석
    if (lowerIdea.includes('app') || lowerIdea.includes('mobile') || lowerIdea.includes('앱')) {
        // projectType = 'mobile'; // MVP에서는 웹 우선
        summary = '모바일 퍼스트 반응형 웹 애플리케이션입니다.';
    }

    if (lowerIdea.includes('sns') || lowerIdea.includes('instagram') || lowerIdea.includes('social')) {
        database = 'PostgreSQL + Realtime';
        auth = 'Supabase Auth (Social Providers)';
    }

    if (lowerIdea.includes('shop') || lowerIdea.includes('commerce') || lowerIdea.includes('쇼핑')) {
        database = 'PostgreSQL';
    }

    // 3. 결과 생성
    const result: ProjectAnalysis = {
        projectName: extractProjectName(idea),
        summary: summary,
        projectType: projectType,
        techStack: {
            frontend: {
                framework: frontendFramework,
                language: 'TypeScript',
                styling: styling,
                stateManagement: 'Zustand',
            },
            backend: {
                type: 'serverless', // Supabase 기본
                platform: 'Supabase',
                database: database,
                authentication: auth,
            },
            deployment: {
                frontend: 'Vercel',
                backend: 'Supabase Cloud',
                cdn: 'Vercel Edge Network',
            }
        },
        coreFeatures: generateCoreFeatures(lowerIdea),
        userRoles: [
            { name: 'Admin', permissions: ['manage_users', 'manage_content'], description: 'System administrator with full access' },
            { name: 'User', permissions: ['create_content', 'read_content'], description: 'Standard authenticated user' },
        ],
        businessRules: [
            'Users must be logged in to create content.',
            'Content must follow community guidelines.',
        ],
        estimatedComplexity: lowerIdea.length > 50 ? 'medium' : 'simple',
        developmentTime: '2-4 weeks',
        teamSize: '1-2 developers',
        reasoning: {
            techStackReason: 'Next.js and Supabase provide the fastest time-to-market with built-in scalability and security features.',
            architectureReason: 'Serverless architecture minimizes DevOps overhead and allows focusing on product features.',
            complexityReason: 'Based on the described features, standard CRUD operations with some realtime capability are required.',
        }
    };

    return result;
}

function extractProjectName(idea: string): string {
    // 간단한 이름 추천 로직
    const words = idea.split(' ');
    if (words.length > 0 && words[0].length > 2) {
        return `My${words[0].charAt(0).toUpperCase() + words[0].slice(1)}App`;
    }
    return 'MyNewProject';
}

function generateCoreFeatures(idea: string): string[] {
    const features = [
        'User Authentication (Login/Signup)',
        'Responsive UI/UX Design',
    ];

    if (idea.includes('sns') || idea.includes('social')) {
        features.push('User Feeds & Timeline');
        features.push('Like & Comment System');
        features.push('Real-time Notifications');
    } else if (idea.includes('shop') || idea.includes('commerce')) {
        features.push('Product Catalog & Search');
        features.push('Shopping Cart & Checkout');
        features.push('Order History Management');
    } else if (idea.includes('board') || idea.includes('blog')) {
        features.push('CRUD Posts');
        features.push('Markdown Editor');
        features.push('Comment System');
    } else {
        features.push('Dashboard & Analytics');
        features.push('File Upload & Management');
    }



    return features;
}

// --- v2.0 Interactive Architect Chat ---

const ArchitectResponseSchema = z.object({
    message: z.string().describe("The AI's response to the user, asking clarifying questions or confirming details."),
    isComplete: z.boolean().describe("True if the user has explicitly indicated they want to proceed/start the project."),
    refinedIdea: z.string().optional().describe("The comprehensive summary of the project idea if isComplete is true."),
});

export async function chatWithArchitect(history: { role: 'user' | 'assistant', content: string }[], userInput: string, config?: AIConfig | null, userId?: string) {
    // 1. If no API key, return mock response for testing/demo
    if (!config?.apiKey) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simple keyword detection for "proceed" in mock mode
        const lowerInput = userInput.toLowerCase();
        if (lowerInput.includes('진행') || lowerInput.includes('start') || lowerInput.includes('go')) {
            return {
                message: "알겠습니다. 프로젝트 분석을 시작합니다.",
                isComplete: true,
                refinedIdea: history.map(m => m.content).join('\n') + '\n' + userInput
            };
        }

        return {
            message: "프로젝트에 대해 조금 더 자세히 말씀해 주시겠어요? 어떤 기능이 가장 중요한가요?",
            isComplete: false
        };
    }

    // 2. Real AI Call
    try {
        const prompt = `
        You are an expert AI Software Architect.
        Your goal is to help the user refine their project idea before generating a technical specification.
        
        Conversation History:
        ${history.map(m => `${m.role}: ${m.content}`).join('\n')}
        User: ${userInput}

        Instructions:
        1. If the user says they want to "proceed", "start", "build it", or "go ahead" (or Korean equivalents like "진행", "시작", "좋아", "진행시켜"):
           - Set 'isComplete' to true.
           - Summarize the entire project idea discussed so far into 'refinedIdea'.
           - set 'message' to a confirmation like "Great, I will now analyze the project...".
        2. If you feel you have gathered enough information to define the MVP (target audience, core features, tech stack preference):
           - Set 'isComplete' to false.
           - Summarize what you understand so far.
           - PROACTIVELY ask "정보가 어느 정도 모인 것 같습니다. 이대로 설계를 진행할까요?" (It seems I have enough information. Shall we proceed with the design?).
        3. Otherwise:
           - Set 'isComplete' to false.
           - Ask 1 relevant clarifying question about the project (e.g., target audience, platforms, specific features).
           - Keep the tone professional but encouraging. NO VAGUE words. Be precise.
        `;

        return await generateAIObject(config, prompt, ArchitectResponseSchema, 'Architect Chat', 'Project Initializer', userId);
    } catch (error: any) {
        console.error("Architect Chat failed:", error);
        return {
            message: `오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`,
            isComplete: false
        };
    }
}
