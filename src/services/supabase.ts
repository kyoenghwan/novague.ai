import { supabase } from './supabase-client';
import { Project } from '@/types';

/**
 * AI Config를 안전하게 JSON 문자열로 직렬화합니다.
 * 이전에 AES 암호화를 사용했으나, 클라이언트 환경에서 Node.js crypto 모듈을
 * 사용할 수 없어 Runtime Error가 발생했습니다. 현재는 JSON 직렬화를 사용합니다.
 * (추후 서버 액션으로 마이그레이션 예정)
 */
function serializeConfig(config: any): string | null {
    if (!config) return null;
    try {
        return JSON.stringify(config);
    } catch {
        return null;
    }
}

/**
 * JSON 문자열 또는 암호화된 문자열에서 AI Config를 안전하게 역직렬화합니다.
 */
function deserializeConfig(stored: string | null): any {
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch {
        return null;
    }
}

/**
 * 새 프로젝트를 Supabase에 저장합니다.
 */
export async function createProject(project: Project) {
    const { data, error } = await supabase
        .from('projects')
        .insert([{
            id: project.id,
            name: project.name,
            description: project.description,
            tech_stack: project.techStack,
            nodes: project.nodes,
            edges: project.edges,
            author: project.author,
            ai_config: serializeConfig(project.aiConfig),
            created_at: new Date(project.createdAt || Date.now()).toISOString(),
            updated_at: new Date().toISOString()
        }]);

    if (error) throw error;
    return data;
}

/**
 * 기존 프로젝트를 Supabase에서 업데이트합니다.
 */
export async function updateProject(id: string, project: Partial<Project>) {
    const updateData: any = {
        name: project.name,
        description: project.description,
        tech_stack: project.techStack,
        nodes: project.nodes,
        edges: project.edges,
        updated_at: new Date().toISOString()
    };

    // aiConfig가 변경된 경우 업데이트
    if (project.aiConfig !== undefined) {
        updateData.ai_config = serializeConfig(project.aiConfig);
    }

    const { data, error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id);

    if (error) throw error;
    return data;
}

/**
 * 현재 사용자의 모든 프로젝트를 Supabase에서 불러옵니다.
 */
export async function getProjects() {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

    if (error) throw error;
    return data.map((p: any) => ({
        ...p,
        techStack: p.tech_stack,
        aiConfig: deserializeConfig(p.ai_config),
        createdAt: new Date(p.created_at).getTime(),
        updatedAt: new Date(p.updated_at)
    }));
}
