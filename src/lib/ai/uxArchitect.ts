'use server';

import { ProjectAnalysis, ScreenAnalysis, Screen, UserFlow, BackgroundProcess, AIConfig } from '@/types';
import { generateAIObject } from '@/lib/ai/aiService';
import { z } from 'zod';

// --- Zod Schemas ---

const ScreenSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['page', 'modal', 'drawer', 'overlay']),
    route: z.string(),
    description: z.string(),
    userStory: z.string(),
    acceptanceCriteria: z.array(z.string()),
    states: z.object({
        loading: z.string(),
        empty: z.string(),
        error: z.string(),
        success: z.string()
    }),
    authentication: z.enum(['public', 'protected', 'admin']),
    permissions: z.array(z.string()),
    performanceTargets: z.object({
        loadTime: z.string(),
        interactionDelay: z.string()
    })
});

const FlowStepSchema = z.object({
    screen: z.string(),
    action: z.string(),
    condition: z.string().optional(),
    nextScreen: z.string()
});

const UserFlowSchema = z.object({
    id: z.string(),
    name: z.string(),
    steps: z.array(FlowStepSchema),
    alternativeFlows: z.array(z.array(FlowStepSchema))
});

const BackgroundProcessSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['webhook', 'cron', 'realtime', 'queue']),
    trigger: z.string(),
    description: z.string(),
    relatedScreens: z.array(z.string())
});

const ScreenAnalysisSchema = z.object({
    screens: z.array(ScreenSchema),
    userFlows: z.array(UserFlowSchema),
    backgroundProcesses: z.array(BackgroundProcessSchema)
});

/**
 * 프로젝트 분석 결과를 바탕으로 화면 구조와 사용자 흐름을 설계하는 AI 엔진
 */
export async function analyzeUX(projectAnalysis: ProjectAnalysis, config?: AIConfig | null): Promise<ScreenAnalysis> {

    if (config?.apiKey) {
        try {
            const prompt = `
            Based on the project analysis, design the UX architecture, including screens, user flows, and background processes.
            
            Project: ${projectAnalysis.projectName}
            Summary: ${projectAnalysis.summary}
            Core Features: ${JSON.stringify(projectAnalysis.coreFeatures)}
            User Roles: ${JSON.stringify(projectAnalysis.userRoles)}

            Requirements:
            1. Define specific screens with routes and types.
            2. specific user flows for key features.
            3. Identify necessary background processes.
            `;

            return await generateAIObject(config, prompt, ScreenAnalysisSchema, 'UX Analysis');
        } catch (error) {
            console.error("AI UX Analysis failed, falling back to mock:", error);
        }
    }

    // --- Mock Implementation (Fallback) ---
    // 1. 시뮬레이션 딜레이
    await new Promise(resolve => setTimeout(resolve, 3000));

    const coreScreens: Screen[] = [];
    const userFlows: UserFlow[] = [];
    const bgProcesses: BackgroundProcess[] = [];

    // 2. Mock Logic based on Project Type

    // Common Screens
    coreScreens.push(createScreen('splash', 'Splash Screen', 'public', '/'));
    coreScreens.push(createScreen('login', 'Login', 'public', '/login'));
    coreScreens.push(createScreen('signup', 'Sign Up', 'public', '/signup'));

    // Feature specific screens
    if (projectAnalysis.techStack.backend.authentication.includes('Supabase')) {
        // Auth related flows
        userFlows.push({
            id: 'auth-flow',
            name: 'User Authentication',
            steps: [
                { screen: 'splash', action: 'Auto Redirect', nextScreen: 'login' },
                { screen: 'login', action: 'Login Success', nextScreen: 'home' },
                { screen: 'login', action: 'Click Signup', nextScreen: 'signup' },
            ],
            alternativeFlows: []
        });
    }

    if (projectAnalysis.coreFeatures.some(f => f.includes('Feed') || f.includes('Post'))) {
        coreScreens.push(createScreen('home', 'Home Feed', 'protected', '/home'));
        coreScreens.push(createScreen('post-detail', 'Post Detail', 'protected', '/post/:id'));
        coreScreens.push(createScreen('create-post', 'Create Post', 'protected', '/post/new', 'modal'));

        bgProcesses.push({
            id: 'img-resize',
            name: 'Image Resizing & Optimization',
            type: 'queue',
            trigger: 'File Upload',
            description: 'Resize uploaded images for various device sizes.',
            relatedScreens: ['create-post']
        });
    }

    if (projectAnalysis.coreFeatures.some(f => f.includes('Cart') || f.includes('Product'))) {
        coreScreens.push(createScreen('product-list', 'Product List', 'public', '/products'));
        coreScreens.push(createScreen('product-detail', 'Product Detail', 'public', '/product/:id'));
        coreScreens.push(createScreen('cart', 'Shopping Cart', 'protected', '/cart', 'drawer'));
        coreScreens.push(createScreen('checkout', 'Checkout', 'protected', '/checkout'));
    }

    if (projectAnalysis.coreFeatures.some(f => f.includes('Admin') || f.includes('Dashboard'))) {
        coreScreens.push(createScreen('admin-dashboard', 'Admin Dashboard', 'admin', '/admin'));
        coreScreens.push(createScreen('user-management', 'User Management', 'admin', '/admin/users'));
    }

    // Default Fallback
    if (coreScreens.length <= 3) {
        coreScreens.push(createScreen('dashboard', 'Dashboard', 'protected', '/dashboard'));
        coreScreens.push(createScreen('settings', 'Settings', 'protected', '/settings'));
    }

    return {
        screens: coreScreens,
        userFlows: userFlows,
        backgroundProcesses: bgProcesses
    };
}

function createScreen(id: string, name: string, auth: 'public' | 'protected' | 'admin', route: string, type: Screen['type'] = 'page'): Screen {
    return {
        id,
        name,
        type,
        route,
        description: `Main interface for ${name}`,
        userStory: `As a user, I want to access ${name} so that I can perform related tasks.`,
        acceptanceCriteria: [
            `${name} should load within 1.5s`,
            'Should display error state if data fetch fails'
        ],
        states: {
            loading: 'Skeleton loader',
            empty: 'No data illustration',
            error: 'Retry button with error message',
            success: 'Full content display'
        },
        authentication: auth,
        permissions: auth === 'admin' ? ['admin_access'] : [],
        performanceTargets: {
            loadTime: '1.5s',
            interactionDelay: '100ms'
        }
    };
}
