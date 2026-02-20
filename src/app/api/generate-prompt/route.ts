import { NextResponse } from 'next/server';
import { generateComponentPrompt } from '@/services/prompt-engine';
import { Project, ComponentNode } from '@/types';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { component, project }: { component: ComponentNode; project: Project } = body;

        if (!component || !component.data) {
            return NextResponse.json({ error: 'Component data is missing' }, { status: 400 });
        }

        if (!project) {
            return NextResponse.json({ error: 'Project context is missing' }, { status: 400 });
        }

        const prompt = generateComponentPrompt(component, project);
        return NextResponse.json({ prompt });
    } catch (error) {
        console.error('Prompt generation error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
