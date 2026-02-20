'use server';

import { ProjectAnalysis, AIConfig } from '@/types';
import { generateAIObject } from '@/services/ai/aiService';
import { z } from 'zod';

const ProjectIdentitySchema = z.object({
    projectName: z.string(),
    oneLiner: z.string(),
    description: z.string(),
    targetUsers: z.array(z.string()),
    primaryGoal: z.string(),
    differentiators: z.array(z.string()),
    referenceServices: z.array(z.string()),
});

const TechnicalScopeSchema = z.object({
    platform: z.object({
        type: z.enum(['web', 'mobile', 'desktop', 'hybrid']),
        priority: z.enum(['web_first', 'mobile_first', 'cross_platform']),
        responsive: z.boolean(),
    }),
    recommendedTechStack: z.object({
        frontend: z.string(),
        backend: z.string(),
        database: z.string(),
        deployment: z.string(),
    }),
    constraints: z.array(z.string()),
});

const FeatureSpecificationSchema = z.object({
    authentication: z.object({
        methods: z.array(z.enum(['email', 'social_google', 'social_kakao', 'phone'])),
        profileSetup: z.object({
            required: z.boolean(),
            fields: z.array(z.string()),
        }),
        accountTypes: z.enum(['public_only', 'private_option', 'invitation_only']),
    }),
    content: z.object({
        types: z.array(z.enum(['photo', 'video', 'text', 'story'])),
        photoSpecs: z.object({
            maxSize: z.string(),
            formats: z.array(z.string()),
            editing: z.boolean(),
            multipleUpload: z.boolean(),
        }),
    }),
    social: z.object({
        interactions: z.array(z.enum(['like', 'comment', 'bookmark', 'share', 'repost'])),
        commentSystem: z.object({
            nested: z.boolean(),
            reactions: z.boolean(),
            maxDepth: z.number().optional(),
        }),
        relationships: z.object({
            type: z.enum(['follow', 'friend', 'both']),
            mutualRequired: z.boolean(),
        }),
    }),
    discovery: z.object({
        feedTypes: z.array(z.enum(['timeline', 'explore', 'trending', 'recommended'])),
        searchCapabilities: z.array(z.enum(['users', 'hashtags', 'content', 'location'])),
        algorithm: z.enum(['chronological', 'engagement', 'hybrid']),
    }),
    notifications: z.object({
        types: z.array(z.enum(['in_app', 'push', 'email'])),
        events: z.array(z.enum(['like', 'comment', 'follow', 'mention', 'post_from_following'])),
    }),
    mvp: z.object({
        mustHave: z.array(z.string()),
        shouldHave: z.array(z.string()),
        couldHave: z.array(z.string()),
    }),
});

const BusinessLogicSchema = z.object({
    contentPolicy: z.object({
        visibility: z.enum(['public', 'followers_only', 'custom_per_post']),
        deletion: z.enum(['immediate', 'soft_delete', 'permanent_after_period']),
        editing: z.enum(['allowed', 'time_limited', 'not_allowed']),
        moderation: z.enum(['none', 'report_system', 'pre_approval']),
    }),
    interactionRules: z.object({
        likeVisibility: z.enum(['public_count', 'hidden_count', 'private_only']),
        commentModeration: z.enum(['open', 'followers_only', 'approval_required']),
        followingModel: z.enum(['immediate', 'approval_required', 'mutual_only']),
    }),
    dataPolicy: z.object({
        userDataRetention: z.string(),
        contentBackup: z.boolean(),
        analytics: z.boolean(),
    }),
});

const ProjectAnalysisSchema = z.object({
    identity: ProjectIdentitySchema,
    technical: TechnicalScopeSchema,
    features: FeatureSpecificationSchema,
    businessLogic: BusinessLogicSchema,
    metadata: z.object({
        createdAt: z.string(),
        estimatedComplexity: z.enum(['simple', 'medium', 'complex']),
        confidenceScore: z.number(),
    }),
});

export async function analyzeProject(idea: string, config?: AIConfig | null): Promise<ProjectAnalysis> {
    if (config?.apiKey) {
        try {
            const prompt = `
당신은 수석 제품 설계자입니다. 다음 아이디어를 바탕으로 개발 가능한 완전한 제품 명세서(ProjectAnalysis)를 생성하십시오.
불필요한 관리 요소(기간, 인원)는 배제하고 제품의 본질에 집중하십시오.

[아이디어]
"${idea}"

[출력 요구사항]
- Identity: 프로젝트 정체성과 차별점
- Technical: 플랫폼 및 권장 기술 스택
- Features: 세부 기능 명세
- BusinessLogic: 정책 및 상호작용 규칙
`;
            return await generateAIObject(config, prompt, ProjectAnalysisSchema, 'Project Analysis');
        } catch (error) {
            console.error("AI Analysis failed:", error);
        }
    }

    const lowerIdea = idea.toLowerCase();
    const isSNS = lowerIdea.includes('sns') || lowerIdea.includes('instagram') || lowerIdea.includes('social');

    return {
        identity: {
            projectName: isSNS ? 'SocialHub' : 'MyProject',
            oneLiner: isSNS ? '이미지 중심 실시간 소통 서비스' : 'A new innovative service',
            description: '사용자 피드백을 반영한 선제적 설계안',
            targetUsers: ['일반 사용자'],
            primaryGoal: '소셜 네트워킹',
            differentiators: ['속도', '보안', '사용자 경험'],
            referenceServices: isSNS ? ['Instagram'] : [],
        },
        technical: {
            platform: { type: 'web', priority: 'web_first', responsive: true },
            recommendedTechStack: { frontend: 'Next.js 14', backend: 'Supabase', database: 'PostgreSQL', deployment: 'Vercel' },
            constraints: [],
        },
        features: {
            authentication: { methods: ['email', 'social_google'], profileSetup: { required: true, fields: ['nickname', 'bio'] }, accountTypes: 'public_only' },
            content: { types: ['photo'], photoSpecs: { maxSize: '10MB', formats: ['jpg', 'png'], editing: true, multipleUpload: true } },
            social: { interactions: ['like', 'comment'], commentSystem: { nested: true, reactions: true }, relationships: { type: 'follow', mutualRequired: false } },
            discovery: { feedTypes: ['timeline'], searchCapabilities: ['hashtags'], algorithm: 'chronological' },
            notifications: { types: ['in_app'], events: ['like', 'comment'] },
            mvp: { mustHave: ['포스트 작성', '좋아요'], shouldHave: ['댓글'], couldHave: ['필터'] },
        },
        businessLogic: {
            contentPolicy: { visibility: 'public', deletion: 'immediate', editing: 'allowed', moderation: 'report_system' },
            interactionRules: { likeVisibility: 'public_count', commentModeration: 'open', followingModel: 'immediate' },
            dataPolicy: { userDataRetention: '즉시 삭제', contentBackup: true, analytics: false },
        },
        metadata: { createdAt: new Date().toISOString(), estimatedComplexity: 'medium', confidenceScore: 0.9 },
    };
}

const ArchitectResponseSchema = z.object({
    message: z.string(),
    phase: z.enum(['identity', 'platform', 'features', 'logic']),
    isComplete: z.boolean(),
    suggestedData: z.any().optional(), // 현재 페이즈에 해당하는 선제 제안 데이터
    refinedIdea: z.string().optional(),
});

/**
 * 4단계 순수 제품 설계 플로우 (Stage 0-1)
 * 사용자가 지치지 않도록 페이즈별로 선제 제안을 던지고 선택적 수정을 유도합니다.
 */
export async function chatWithArchitect(history: any[], userInput: string, config?: AIConfig | null, userId?: string) {
    if (!config?.apiKey) {
        return { message: "AI 설정이 필요합니다.", isComplete: false };
    }

    try {
        const prompt = `
당신은 수석 제품 설계자(Lead Product Architect)입니다. 사용자의 "${userInput}" 입력을 기반으로 4단계 설계 공정을 진행하십시오.

[핵심 미션: 선제적 설계]
사용자가 아이디어를 던지면, "그럼 어떤 기능을 넣을까요?"라고 묻지 마십시오. 
대신, "당신의 아이디어를 분석했을 때, 업계 표준에 따른 베이스라인을 다음과 같이 설계했습니다. 확인해 보시고 수정이 필요한 부분만 알려주세요."라고 말하며 즉시 **구조화된 설계안(suggestedData)**을 제시하십시오.

[대화 원칙]
1. 제안 중심: 질문보다 제안이 우선입니다. 사용자의 의도가 불분명하더라도 가장 확률 높은 베이스라인을 선택하십시오.
2. 카드 시각화: 반드시 'suggestedData' 필드에 해당 단계의 설계 데이터를 채워넣으십시오. UI에서 이 데이터를 카드로 시각화합니다.
3. 단계 이동: 사용자가 긍정적이면 즉시 다음 단계의 제안으로 넘어가십시오.

[공정 단계]
1. identity: 프로젝트 이름, 한줄 정의, 목표 (Ambiguity를 Specs로 전환)
2. platform: 권장 플랫폼(Web/App), 기술 스택 (Frontend/Backend)
3. features: MVP 필수 기능 리스트 (Must-Have)
4. logic: 주요 정책 (공개 범위, 데이터 보관 등)

[대화 문맥]
이전 대화: ${JSON.stringify(history)}

[출력 규격]
- message: 사용자에게 전달할 한글 메시지 (제안의 핵심 내용과 "그대로 진행할까요? 아니면 수정할까요?"라는 권유 포함)
- phase: 현재 처리 중인 단계
- suggestedData: 해당 단계의 구조화된 제안 내용 (JSON)
- isComplete: 모든 4단계가 승인되면 true
- refinedIdea: 현재까지 확정된 프로젝트 정의 요약
`;
        return await generateAIObject(config, prompt, ArchitectResponseSchema, 'Architect Chat', 'Project Initializer', userId);
    } catch (error) {
        console.error("Architect chat failed:", error);
        return { message: "오류가 발생했습니다.", isComplete: false };
    }
}
