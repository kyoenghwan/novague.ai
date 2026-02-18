import { NextResponse } from 'next/server';
import { generateComponentPrompt } from '@/lib/promptEngine';
import { Project, ComponentNode } from '@/types';

/**
 * 프롬프트 생성 API 핸들러
 * POST /api/generate-prompt
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { component, project }: { component: ComponentNode; project: Project } = body;

        // 데이터 유효성 검사
        if (!component || !component.data) {
            return NextResponse.json(
                { error: 'Component data is missing or invalid' },
                { status: 400 }
            );
        }

        if (!project) {
            return NextResponse.json(
                { error: 'Project context is missing' },
                { status: 400 }
            );
        }

        // 프롬프트 생성
        const prompt = generateComponentPrompt(component, project);

        return NextResponse.json({ prompt });
    } catch (error) {
        console.error('Prompt generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate prompt' },
            { status: 500 }
        );
    }
}
