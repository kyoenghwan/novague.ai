import { supabase } from './supabase-client';
import { Project } from '@/types';
import { safeEncryptConfig, safeDecryptConfig } from '@/lib/encryption';

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
            ai_config: safeEncryptConfig(project.aiConfig),
            created_at: new Date(project.createdAt || Date.now()).toISOString(),
            updated_at: new Date().toISOString()
        }]);

    if (error) throw error;
    return data;
}

export async function updateProject(id: string, project: Partial<Project>) {
    const updateData: any = {
        name: project.name,
        description: project.description,
        tech_stack: project.techStack,
        nodes: project.nodes,
        edges: project.edges,
        updated_at: new Date().toISOString()
    };

    if (project.aiConfig) {
        updateData.ai_config = safeEncryptConfig(project.aiConfig);
    }

    const { data, error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id);

    if (error) throw error;
    return data;
}

export async function getProjects() {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

    if (error) throw error;
    return data.map((p: any) => ({
        ...p,
        techStack: p.tech_stack,
        aiConfig: safeDecryptConfig(p.ai_config),
        createdAt: new Date(p.created_at).getTime(),
        updatedAt: new Date(p.updated_at)
    }));
}
