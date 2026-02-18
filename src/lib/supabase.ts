import { supabase } from './supabaseClient';
import { Project } from '@/types';

/**
 * DB에서 가져온 프로젝트 데이터 타입 (Snake Case)
 */
interface DBProject {
    id: string;
    name: string;
    description: string | null;
    tech_stack: string[] | null;
    nodes: any;
    edges: any;
    created_at: string;
    updated_at: string;
    user_id: string;
}

/**
 * 프로젝트 생성
 */
export async function createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'author'>) {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error('로그인이 필요합니다.');

        const { data, error } = await supabase
            .from('projects')
            .insert({
                name: project.name,
                description: project.description,
                tech_stack: project.techStack,
                nodes: project.nodes,
                edges: project.edges,
                user_id: user.id
            })
            .select()
            .single();

        if (error) throw error;

        return mapDBToProject(data);
    } catch (error) {
        console.error('Error creating project:', error);
        throw error;
    }
}

/**
 * 사용자의 모든 프로젝트 조회
 */
export async function getProjects(): Promise<Project[]> {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data as DBProject[]).map(mapDBToProject);
    } catch (error) {
        console.error('Error fetching projects:', error);
        return []; // 에러 시 빈 배열 반환 (UI 처리를 위해 throw 할 수도 있음)
    }
}

/**
 * 프로젝트 업데이트
 */
export async function updateProject(id: string, updates: Partial<Project>) {
    try {
        const dbUpdates: any = {
            updated_at: new Date().toISOString(),
        };

        if (updates.name) dbUpdates.name = updates.name;
        if (updates.description) dbUpdates.description = updates.description;
        if (updates.techStack) dbUpdates.tech_stack = updates.techStack;
        if (updates.nodes) dbUpdates.nodes = updates.nodes;
        if (updates.edges) dbUpdates.edges = updates.edges;

        const { error } = await supabase
            .from('projects')
            .update(dbUpdates)
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error('Error updating project:', error);
        throw error;
    }
}

/**
 * 프로젝트 삭제
 */
export async function deleteProject(id: string) {
    try {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting project:', error);
        throw error;
    }
}

// --- Helper ---

function mapDBToProject(dbProject: DBProject): Project {
    return {
        id: dbProject.id,
        name: dbProject.name,
        description: dbProject.description || '',
        techStack: dbProject.tech_stack || [],
        nodes: dbProject.nodes || [],
        edges: dbProject.edges || [],
        createdAt: new Date(dbProject.created_at).getTime(),
        updatedAt: new Date(dbProject.updated_at),
        author: dbProject.user_id,
    };
}

/**
 * 채팅 메시지 저장
 */
export async function saveChatMessage(message: {
    role: 'user' | 'assistant' | 'system',
    content: string,
    stage?: string,
    projectId?: string
}) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('chat_history')
            .insert({
                user_id: user.id,
                project_id: message.projectId,
                role: message.role,
                content: message.content,
                stage: message.stage
            });

        if (error) throw error;
    } catch (error) {
        console.error('Error saving chat message:', error);
    }
}
