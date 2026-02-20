import { Node, Edge } from 'reactflow';

export interface PropDefinition { name: string; type: string; required: boolean; defaultValue?: any; description: string; }
export interface StateDefinition { name: string; type: string; initialValue: any; description: string; }
export interface EventDefinition { name: string; payloadType?: string; description: string; }
export interface APIEndpoint { method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'; path: string; description: string; authentication: boolean; authorization: string[]; request: any; response: any; businessLogic: string[]; relatedTables: string[]; usedByScreens: string[]; }
export interface DatabaseTable { name: string; description: string; fields: { name: string; type: string; constraints: string[]; defaultValue?: any; description: string; }[]; primaryKey: string; foreignKeys: string[]; }
export interface ComponentData { label: string; type: 'page' | 'component' | 'api' | 'database'; description: string; requirements: string[]; interfaces?: { props: PropDefinition[]; state: StateDefinition[]; events: EventDefinition[]; }; endpoints?: APIEndpoint[]; tableSchema?: DatabaseTable; techSpec: { framework: string; styling: string; stateManagement: string; }; dependencies?: string[]; filePath: string; }
export type ComponentNode = Node<ComponentData>;
export type ComponentEdge = Edge & { type: 'dependency' | 'dataFlow' | 'navigation'; };
export type AIProvider = 'openai' | 'anthropic' | 'google';
export interface AIConfig { provider: AIProvider; model: string; apiKey: string; temperature?: number; maxTokens?: number; }
export interface GitHubConfig { token: string; owner: string; repo: string; branch?: string; }
export const SUPPORTED_AI_MODELS = { openai: ['gpt-4-turbo', 'gpt-4o', 'gpt-3.5-turbo'], anthropic: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'], google: ['gemini-1.5-pro', 'gemini-1.5-flash'], };
export interface Project { id: string; name: string; description: string; techStack: string[]; nodes: ComponentNode[]; edges: ComponentEdge[]; createdAt?: number; updatedAt?: Date; author?: string; aiConfig?: AIConfig | null; githubConfig?: GitHubConfig; }
export interface ProjectAnalysis {
    identity: {
        projectName: string;
        oneLiner: string;
        description: string;
        targetUsers: string[];
        primaryGoal: string;
        differentiators: string[];
        referenceServices: string[];
    };

    technical: {
        platform: {
            type: 'web' | 'mobile' | 'desktop' | 'hybrid';
            priority: 'web_first' | 'mobile_first' | 'cross_platform';
            responsive: boolean;
        };
        recommendedTechStack: {
            frontend: string;
            backend: string;
            database: string;
            deployment: string;
        };
        constraints: string[];
    };

    features: {
        authentication: {
            methods: ('email' | 'social_google' | 'social_kakao' | 'phone')[];
            profileSetup: {
                required: boolean;
                fields: string[];
            };
            accountTypes: 'public_only' | 'private_option' | 'invitation_only';
        };
        content: {
            types: ('photo' | 'video' | 'text' | 'story')[];
            photoSpecs: {
                maxSize: string;
                formats: string[];
                editing: boolean;
                multipleUpload: boolean;
            };
        };
        social: {
            interactions: ('like' | 'comment' | 'bookmark' | 'share' | 'repost')[];
            commentSystem: {
                nested: boolean;
                reactions: boolean;
                maxDepth?: number;
            };
            relationships: {
                type: 'follow' | 'friend' | 'both';
                mutualRequired: boolean;
            };
        };
        discovery: {
            feedTypes: ('timeline' | 'explore' | 'trending' | 'recommended')[];
            searchCapabilities: ('users' | 'hashtags' | 'content' | 'location')[];
            algorithm: 'chronological' | 'engagement' | 'hybrid';
        };
        notifications: {
            types: ('in_app' | 'push' | 'email')[];
            events: ('like' | 'comment' | 'follow' | 'mention' | 'post_from_following')[];
        };
        mvp: {
            mustHave: string[];
            shouldHave: string[];
            couldHave: string[];
        };
    };

    businessLogic: {
        contentPolicy: {
            visibility: 'public' | 'followers_only' | 'custom_per_post';
            deletion: 'immediate' | 'soft_delete' | 'permanent_after_period';
            editing: 'allowed' | 'time_limited' | 'not_allowed';
            moderation: 'none' | 'report_system' | 'pre_approval';
        };
        interactionRules: {
            likeVisibility: 'public_count' | 'hidden_count' | 'private_only';
            commentModeration: 'open' | 'followers_only' | 'approval_required';
            followingModel: 'immediate' | 'approval_required' | 'mutual_only';
        };
        dataPolicy: {
            userDataRetention: string;
            contentBackup: boolean;
            analytics: boolean;
        };
    };

    metadata: {
        createdAt: string;
        estimatedComplexity: 'simple' | 'medium' | 'complex';
        confidenceScore: number;
    };
}

export interface Screen {
    id: string;
    name: string;
    description: string;
    type: 'page' | 'modal' | 'drawer' | 'sidebar';
}

export interface ScreenFlow {
    from: string;
    to: string;
    action: string;
    description: string;
}

export interface BackgroundProcess {
    id: string;
    name: string;
    description: string;
    type: 'cron' | 'webhook' | 'worker';
    trigger: string;
}

export interface UXFlow {
    screens: Screen[];
    flows: ScreenFlow[];
    backgroundProcesses: BackgroundProcess[];
}
