'use server';

import { ScreenAnalysis, DataArchitecture, ComponentArchitecture, Component, ScreenComponents, SharedComponent, AIConfig } from '@/types';
import { generateAIObject } from '@/lib/ai/aiService';
import { z } from 'zod';

// --- Zod Schemas ---

const PropDefinitionSchema = z.object({
    name: z.string(),
    type: z.string(),
    required: z.boolean(),
    defaultValue: z.any().optional(),
    description: z.string(),
    validation: z.string().optional()
});

const StateDefinitionSchema = z.object({
    name: z.string(),
    type: z.string(),
    initialValue: z.any(),
    description: z.string()
});

const EventDefinitionSchema = z.object({
    name: z.string(),
    payloadType: z.string().optional(),
    description: z.string()
});

const MethodDefinitionSchema = z.object({
    name: z.string(),
    parameters: z.array(z.object({ name: z.string(), type: z.string() })),
    returnType: z.string(),
    description: z.string()
});

const ComponentSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['layout', 'feature', 'ui', 'form']),
    filePath: z.string(),
    description: z.string(),
    responsibility: z.string(),
    props: z.array(PropDefinitionSchema),
    state: z.array(StateDefinitionSchema),
    events: z.array(EventDefinitionSchema),
    methods: z.array(MethodDefinitionSchema),
    dependencies: z.object({
        components: z.array(z.string()),
        hooks: z.array(z.string()),
        apis: z.array(z.string()),
        libraries: z.array(z.string())
    }),
    styling: z.object({
        framework: z.string(),
        responsive: z.boolean(),
        animations: z.array(z.string()),
        variants: z.array(z.string())
    }),
    testScenarios: z.array(z.string()),
    mockData: z.any(),
    estimatedComplexity: z.enum(['low', 'medium', 'high']),
    rerenderOptimization: z.array(z.string())
});

const LayoutComponentSchema = z.object({
    name: z.string(),
    filePath: z.string(),
    description: z.string()
});

const ScreenComponentsSchema = z.object({
    screenId: z.string(),
    layout: LayoutComponentSchema,
    featComponents: z.array(ComponentSchema),
    uiComponents: z.array(ComponentSchema)
});

const SharedComponentSchema = ComponentSchema.extend({
    usageCount: z.number()
});

const ComponentLibraryItemSchema = z.object({
    name: z.string(),
    version: z.string(),
    usage: z.string()
});

const ComponentArchitectureSchema = z.object({
    screens: z.array(ScreenComponentsSchema),
    sharedComponents: z.array(SharedComponentSchema),
    componentLibrary: z.array(ComponentLibraryItemSchema)
});

/**
 * 화면 및 데이터 구조를 바탕으로 컴포넌트 아키텍처를 설계하는 AI 엔진
 */
export async function analyzeComponents(ux: ScreenAnalysis, data: DataArchitecture, config?: AIConfig | null): Promise<ComponentArchitecture> {

    if (config?.apiKey) {
        try {
            const prompt = `
            Design the Component Architecture based on the UX flow and Data architecture.
            
            Screens: ${JSON.stringify(ux.screens.map(s => s.name))}
            APIs: ${JSON.stringify(data.apis.map(a => a.path))}

            Requirements:
            1. Break down each screen into logical components (Layout, Feature, UI).
            2. Identify shared components.
            3. Define props, state, and dependencies for key components.
            `;

            return await generateAIObject(config, prompt, ComponentArchitectureSchema, 'Component Architecture Analysis');
        } catch (error) {
            console.error("AI Component Analysis failed, falling back to mock:", error);
        }
    }

    // --- Mock Implementation (Fallback) ---
    // 1. Simulation Delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    const screenComponents: ScreenComponents[] = [];
    const sharedComps: SharedComponent[] = [];

    // 2. Common Shared Components
    const commonUI = ['Button', 'Input', 'Card', 'Modal', 'Avatar'];
    commonUI.forEach(name => {
        sharedComps.push(createSharedComponent(name, 'ui'));
    });

    // 3. Process Screens
    ux.screens.forEach(screen => {
        const feats: Component[] = [];
        const uis: Component[] = [];

        // Layout determination
        const layoutName = screen.type === 'modal' ? 'ModalLayout' :
            screen.authentication === 'admin' ? 'AdminLayout' :
                screen.authentication === 'protected' ? 'DashboardLayout' : 'PublicLayout';

        // Feature Components based on Screen Name
        if (screen.id.includes('login') || screen.id.includes('signup')) {
            feats.push(createComponent(`AuthForm`, 'form', 'Handles user authentication input and validation', screen.id));
        } else if (screen.id.includes('feed') || screen.id.includes('post')) {
            feats.push(createComponent(`PostList`, 'feature', 'Displays a list of posts with infinite scroll', screen.id));
            feats.push(createComponent(`PostCard`, 'feature', 'Individual post item with interaction buttons', screen.id));
            feats.push(createComponent(`CreatePostModal`, 'form', 'Form to create new posts with media upload', screen.id));
        } else if (screen.id.includes('product')) {
            feats.push(createComponent(`ProductList`, 'feature', 'Grid view of products with filters', screen.id));
            feats.push(createComponent(`ProductCard`, 'feature', 'Product summary card', screen.id));
        } else if (screen.id.includes('cart')) {
            feats.push(createComponent(`CartItemList`, 'feature', 'List of items in cart', screen.id));
            feats.push(createComponent(`OrderSummary`, 'feature', 'Calculates total price and shipping', screen.id));
        }

        // Add some UI components per screen logic (mock)
        uis.push(createComponent(`${screen.name.replace(/\s/g, '')}Header`, 'ui', `Header specific for ${screen.name}`, screen.id));

        screenComponents.push({
            screenId: screen.id,
            layout: {
                name: layoutName,
                filePath: `/components/layouts/${layoutName}.tsx`,
                description: `Standard ${layoutName} wrapper`
            },
            featComponents: feats,
            uiComponents: uis
        });
    });

    return {
        screens: screenComponents,
        sharedComponents: sharedComps,
        componentLibrary: [
            { name: 'shadcn/ui', version: 'latest', usage: 'Base UI components' },
            { name: 'lucide-react', version: 'latest', usage: 'Icons' },
            { name: 'react-hook-form', version: 'latest', usage: 'Form handling' }
        ]
    };
}

function createComponent(name: string, type: Component['type'], desc: string, screenId?: string): Component {
    const isShared = !screenId;
    const path = isShared ? `/components/ui/${name.toLowerCase()}.tsx` : `/components/${screenId}/${name}.tsx`;

    return {
        id: crypto.randomUUID(),
        name,
        type,
        filePath: path,
        description: desc,
        responsibility: isShared ? 'Reusable UI element' : 'Business logic and composition',
        props: [
            { name: 'className', type: 'string', required: false, description: 'Additional CSS classes' },
            ...(type === 'feature' ? [{ name: 'data', type: 'any', required: true, description: 'Data to display' }] : [])
        ],
        state: type === 'form' ? [{ name: 'isLoading', type: 'boolean', initialValue: false, description: 'Submission state' }] : [],
        events: type === 'ui' ? [{ name: 'onClick', description: 'Click handler' }] : [],
        methods: [],
        dependencies: {
            components: [],
            hooks: [],
            apis: [],
            libraries: []
        },
        styling: {
            framework: 'Tailwind CSS',
            responsive: true,
            animations: [],
            variants: []
        },
        testScenarios: ['Should render correctly', 'Should handle interaction'],
        mockData: {},
        estimatedComplexity: type === 'feature' ? 'medium' : 'low',
        rerenderOptimization: []
    };
}

function createSharedComponent(name: string, type: Component['type']): SharedComponent {
    const comp = createComponent(name, type, `Shared ${name} component`);
    return {
        ...comp,
        usageCount: Math.floor(Math.random() * 10) + 1
    };
}
