'use server';

import { ScreenAnalysis, DataArchitecture, ComponentArchitecture, ValidationResult, Issue, Suggestion, ProjectAnalysis, Optimization, AIConfig } from '@/types';
import { generateAIObject } from '@/lib/ai/aiService';
import { z } from 'zod';

// --- Zod Schemas ---

const IssueSchema = z.object({
    type: z.enum(['missing_dependency', 'circular_dependency', 'type_mismatch', 'security_gap', 'performance_issue', 'accessibility']),
    severity: z.enum(['critical', 'high', 'medium', 'low']),
    location: z.string(),
    description: z.string(),
    solution: z.string(),
    autoFixAvailable: z.boolean()
});

const SuggestionSchema = z.object({
    category: z.enum(['architecture', 'performance', 'security', 'maintainability']),
    title: z.string(),
    description: z.string(),
    impact: z.enum(['high', 'medium', 'low']),
    effort: z.enum(['low', 'medium', 'high'])
});

const OptimizationSchema = z.object({
    target: z.string(),
    description: z.string(),
    estimatedGain: z.string()
});

const ValidationResultSchema = z.object({
    isValid: z.boolean(),
    score: z.number(),
    criticalIssues: z.array(IssueSchema),
    warnings: z.array(IssueSchema),
    suggestions: z.array(SuggestionSchema),
    optimizations: z.array(OptimizationSchema)
});

/**
 * 전체 설계의 일관성 및 품질을 검증하는 AI 엔진
 */
export async function validateIntegration(
    project: ProjectAnalysis,
    ux: ScreenAnalysis,
    data: DataArchitecture,
    components: ComponentArchitecture,
    config?: AIConfig | null
): Promise<ValidationResult> {

    if (config?.apiKey) {
        try {
            const prompt = `
            Validate the consistency and quality of the project design.
            
            Project: ${project.projectName}
            Screens: ${JSON.stringify(ux.screens.map(s => s.name))}
            APIs: ${JSON.stringify(data.apis.map(a => a.path))}
            Components: ${JSON.stringify(components.screens.map(s => s.layout.name))}

            Requirements:
            1. Check for missing dependencies (e.g., component using non-existent API).
            2. Identify security gaps.
            3. Detect potential circular dependencies.
            4. Provide suggestions and optimizations.
            `;

            return await generateAIObject(config, prompt, ValidationResultSchema, 'Integration Validation');
        } catch (error) {
            console.error("AI Validation failed, falling back to mock:", error);
        }
    }

    // --- Mock Implementation (Fallback) ---
    // 1. Simulation Delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    const issues: Issue[] = [];
    const suggestions: Suggestion[] = [];

    // 2. Mock Validation Logic

    // Check 1: Missing API Dependencies
    // Iterate components and check if their API dependencies exist in DataArchitecture
    components.screens.forEach(screen => {
        screen.featComponents.forEach(comp => {
            comp.dependencies.apis.forEach(apiDep => {
                const apiExists = data.apis.some(api =>
                    api.path === apiDep || apiDep.includes(api.path) // Simple check
                );
                if (!apiExists && Math.random() > 0.7) { // Random failure for demo
                    issues.push({
                        type: 'missing_dependency',
                        severity: 'high',
                        location: `Component: ${comp.name}`,
                        description: `Dependency based on API '${apiDep}' is not defined in Data Architecture.`,
                        solution: `Create an endpoint for '${apiDep}' in the Data Architect stage or remove dependency.`,
                        autoFixAvailable: true
                    });
                }
            });
        });
    });

    // Check 2: Security Gaps
    // Check if 'admin' screens rely on unprotected APIs
    ux.screens.filter(s => s.authentication === 'admin').forEach(screen => {
        // Find components in this screen
        const screenComps = components.screens.find(sc => sc.screenId === screen.id);
        if (screenComps) {
            screenComps.featComponents.forEach(comp => {
                // Mock: Assume some component uses a public API
                if (Math.random() > 0.9) {
                    issues.push({
                        type: 'security_gap',
                        severity: 'critical',
                        location: `Screen: ${screen.name} / Component: ${comp.name}`,
                        description: `Admin screen uses potentially unprotected API endpoints.`,
                        solution: `Ensure all APIs used in admin screens have 'authorization' middleware.`,
                        autoFixAvailable: false
                    });
                }
            });
        }
    });

    // Check 3: Circular Dependencies (Mock)
    if (Math.random() > 0.9) {
        issues.push({
            type: 'circular_dependency',
            severity: 'medium',
            location: `Components: PostCard <-> CommentList`,
            description: `Potential circular dependency detected between PostCard and CommentList.`,
            solution: `Refactor shared logic into a custom hook or context.`,
            autoFixAvailable: false
        });
    }

    // Add Suggestions
    suggestions.push({
        category: 'performance',
        title: 'Implement Virtualization',
        description: 'Several list components could benefit from virtualization (e.g. react-window) to handle large datasets.',
        impact: 'high',
        effort: 'medium'
    });

    suggestions.push({
        category: 'maintainability',
        title: 'Extract Common Types',
        description: 'Duplicate interface definitions found across features. Extract to a shared types file.',
        impact: 'medium',
        effort: 'low'
    });

    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const score = Math.max(0, 100 - (criticalCount * 20) - (issues.length * 5));

    return {
        isValid: criticalCount === 0,
        score,
        criticalIssues: issues.filter(i => i.severity === 'critical'),
        warnings: issues.filter(i => i.severity !== 'critical'),
        suggestions,
        optimizations: [
            { target: 'Bundle Size', description: 'Lazy load admin routes to reduce initial bundle size.', estimatedGain: '150KB' },
            { target: 'Images', description: 'Use Next.js Image component with WebP conversion.', estimatedGain: '40%' }
        ]
    };
}
