import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Project, ComponentNode, ComponentEdge, ComponentData, AIConfig } from '@/types';
import { applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from 'reactflow';
import { createProject as apiCreateProject, updateProject as apiUpdateProject, getProjects as apiGetProjects } from '@/services/supabase';

interface ProjectState {
    currentProject: Project | null;
    projects: Project[];
    selectedNode: ComponentNode | null;
    isLoading: boolean;
    lastSaved: Date | null;
    globalAIConfig: AIConfig | null;
    hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;

    setCurrentProject: (project: Project) => void;
    createProject: (name: string, description: string, techStack: string[]) => Promise<void>;
    updateProject: (updates: Partial<Project>) => void;
    saveProject: () => Promise<void>;
    loadProjects: () => Promise<void>;
    addNode: (node: ComponentNode) => void;
    updateNode: (nodeId: string, data: Partial<ComponentData>) => void;
    deleteNode: (nodeId: string) => void;
    setSelectedNode: (node: ComponentNode | null) => void;
    addEdge: (edge: ComponentEdge) => void;
    deleteEdge: (edgeId: string) => void;
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    setGlobalAIConfig: (config: AIConfig | null) => void;
}

export const useProjectStore = create<ProjectState>()(
    persist(
        immer((set, get) => ({
            currentProject: null,
            projects: [],
            selectedNode: null,
            isLoading: false,
            lastSaved: null,
            globalAIConfig: null,
            hasHydrated: false,

            setHasHydrated: (state) => set((stateDraft) => { stateDraft.hasHydrated = state; }),
            setGlobalAIConfig: (config) => set((state) => {
                state.globalAIConfig = config;
                if (state.currentProject) {
                    state.currentProject.aiConfig = config as any;
                }
            }),
            setCurrentProject: (project) => set((state) => { state.currentProject = project; }),
            setSelectedNode: (node) => set((state) => { state.selectedNode = node; }),

            createProject: async (name, description, techStack) => {
                set((state) => { state.isLoading = true; });
                const newProject: Project = {
                    id: crypto.randomUUID(),
                    name,
                    description,
                    techStack,
                    nodes: [],
                    edges: [],
                    aiConfig: get().globalAIConfig,
                    createdAt: Date.now(),
                    updatedAt: new Date(),
                };
                set((state) => {
                    state.currentProject = newProject;
                    state.isLoading = false;
                });
                await apiCreateProject(newProject);
            },

            updateProject: (updates) => set((state) => {
                if (state.currentProject) {
                    Object.assign(state.currentProject, { ...updates, updatedAt: new Date() });
                }
            }),

            saveProject: async () => {
                const { currentProject } = get();
                if (!currentProject) return;
                try {
                    await apiUpdateProject(currentProject.id, currentProject);
                    set((state) => { state.lastSaved = new Date(); });
                } catch (e) {
                    console.error('Save failed', e);
                }
            },

            loadProjects: async () => {
                try {
                    const projects = await apiGetProjects();
                    set((state) => { state.projects = projects; });
                } catch (e) {
                    console.error('Load failed', e);
                }
            },

            addNode: (node) => set((state) => {
                if (state.currentProject) state.currentProject.nodes.push(node);
            }),

            updateNode: (nodeId, data) => set((state) => {
                if (state.currentProject) {
                    const node = state.currentProject.nodes.find(n => n.id === nodeId);
                    if (node) {
                        node.data = { ...node.data, ...data };
                        if (state.selectedNode?.id === nodeId) {
                            state.selectedNode = { ...node };
                        }
                    }
                }
            }),

            deleteNode: (nodeId) => set((state) => {
                if (state.currentProject) {
                    state.currentProject.nodes = state.currentProject.nodes.filter(n => n.id !== nodeId);
                    state.currentProject.edges = state.currentProject.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
                    if (state.selectedNode?.id === nodeId) state.selectedNode = null;
                }
            }),

            addEdge: (edge) => set((state) => {
                if (state.currentProject) {
                    state.currentProject.edges.push(edge);
                    const target = state.currentProject.nodes.find(n => n.id === edge.target);
                    if (target) {
                        if (!target.data.dependencies) target.data.dependencies = [];
                        if (!target.data.dependencies.includes(edge.source)) target.data.dependencies.push(edge.source);
                    }
                }
            }),

            deleteEdge: (edgeId) => set((state) => {
                if (state.currentProject) {
                    const edge = state.currentProject.edges.find(e => e.id === edgeId);
                    if (edge) {
                        const target = state.currentProject.nodes.find(n => n.id === edge.target);
                        if (target?.data.dependencies) {
                            target.data.dependencies = target.data.dependencies.filter(id => id !== edge.source);
                        }
                    }
                    state.currentProject.edges = state.currentProject.edges.filter(e => e.id !== edgeId);
                }
            }),

            onNodesChange: (changes) => set((state) => {
                if (state.currentProject) {
                    state.currentProject.nodes = applyNodeChanges(changes, state.currentProject.nodes) as ComponentNode[];
                }
            }),

            onEdgesChange: (changes) => set((state) => {
                if (state.currentProject) {
                    state.currentProject.edges = applyEdgeChanges(changes, state.currentProject.edges) as ComponentEdge[];
                }
            }),
        })),
        {
            name: 'vibe-project-storage',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
