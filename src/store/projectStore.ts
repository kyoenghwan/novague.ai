import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Project, ComponentNode, ComponentEdge, ComponentData } from '@/types';
import { applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import { createProject as apiCreateProject, updateProject as apiUpdateProject, getProjects as apiGetProjects } from '@/lib/supabase';

interface ProjectState {
    // 상태
    currentProject: Project | null;
    projects: Project[];
    selectedNode: ComponentNode | null;
    isLoading: boolean;
    lastSaved: Date | null;

    // 프로젝트 관리
    setCurrentProject: (project: Project) => void;
    createProject: (name: string, description: string, techStack: string[]) => Promise<void>;
    updateProject: (updates: Partial<Project>) => void;

    // 데이터 영속성
    saveProject: () => Promise<void>;
    loadProjects: () => Promise<void>;
    loadProject: (projectId: string) => Promise<void>;

    // 노드 관리
    addNode: (node: ComponentNode) => void;
    updateNode: (nodeId: string, data: Partial<ComponentData>) => void;
    deleteNode: (nodeId: string) => void;
    setSelectedNode: (node: ComponentNode | null) => void;

    // 엣지 관리
    addEdge: (edge: ComponentEdge) => void;
    deleteEdge: (edgeId: string) => void;

    // React Flow Changes
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;

    // AI 설정
    globalAIConfig: import('@/types').AIConfig | null;
    setGlobalAIConfig: (config: import('@/types').AIConfig | null) => void;

    // 유틸리티
    reset: () => void;
}

/**
 * 프로젝트 상태 관리를 위한 Zustand Store
 * - persist: 로컬 스토리지에 자동 저장
 * - immer: 불변성 관리 단순화
 */
export const useProjectStore = create<ProjectState>()(
    persist(
        immer((set, get) => ({
            currentProject: null,
            projects: [],
            selectedNode: null,
            isLoading: false,
            lastSaved: null,
            globalAIConfig: null,

            setGlobalAIConfig: (config) =>
                set((state) => {
                    state.globalAIConfig = config;
                }),

            setCurrentProject: (project) =>
                set((state) => {
                    state.currentProject = project;
                }),

            createProject: async (name, description, techStack) => {
                set((state) => { state.isLoading = true; });
                try {
                    // 로컬 상태 생성
                    const newProject: Project = {
                        id: crypto.randomUUID(),
                        name,
                        description,
                        techStack,
                        nodes: [],
                        edges: [],
                        createdAt: new Date().getTime(),
                        updatedAt: new Date(),
                        author: 'temp-user',
                    };

                    set((state) => {
                        state.currentProject = newProject;
                        state.selectedNode = null;
                        state.isLoading = false;
                        state.lastSaved = new Date();
                    });

                    // 선택적: 생성 즉시 서버 저장
                    await apiCreateProject(newProject);

                } catch (error) {
                    console.error("Failed to create project", error);
                    set((state) => { state.isLoading = false; });
                }
            },

            updateProject: (updates) =>
                set((state) => {
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
                } catch (error) {
                    console.error("Auto-save failed:", error);
                    // 에러 처리 로직 (예: Toast 알림)
                }
            },

            loadProjects: async () => {
                set((state) => { state.isLoading = true; });
                try {
                    const projects = await apiGetProjects();
                    set((state) => {
                        state.projects = projects;
                        state.isLoading = false;
                    });
                } catch (error) {
                    console.error("Failed to load projects", error);
                    set((state) => { state.isLoading = false; });
                }
            },

            loadProject: async (projectId: string) => {
                // 프로젝트 목록에서 찾거나 API 요청
                const { projects } = get();
                const project = projects.find(p => p.id === projectId);
                if (project) {
                    set((state) => { state.currentProject = project; });
                } else {
                    console.log("Project not found in local list, fetching...");
                    // fetchProject(projectId) 구현 필요 - 현재 로컬 리스트에 의존하도록 유지하거나 단건 조회 API 추가 필요
                }
            },

            addNode: (node) =>
                set((state) => {
                    if (state.currentProject) {
                        state.currentProject.nodes.push(node);
                    }
                }),

            updateNode: (nodeId, data) =>
                set((state) => {
                    if (state.currentProject) {
                        const node = state.currentProject.nodes.find((n) => n.id === nodeId);
                        if (node) {
                            node.data = { ...node.data, ...data };
                            state.currentProject.updatedAt = new Date();
                            if (state.selectedNode?.id === nodeId) {
                                state.selectedNode = { ...node };
                            }
                        }
                    }
                }),

            deleteNode: (nodeId) =>
                set((state) => {
                    if (state.currentProject) {
                        state.currentProject.nodes = state.currentProject.nodes.filter(
                            (n) => n.id !== nodeId
                        );
                        state.currentProject.edges = state.currentProject.edges.filter(
                            (e) => e.source !== nodeId && e.target !== nodeId
                        );
                        if (state.selectedNode?.id === nodeId) {
                            state.selectedNode = null;
                        }
                        state.currentProject.updatedAt = new Date();
                    }
                }),

            setSelectedNode: (node) =>
                set((state) => {
                    state.selectedNode = node;
                }),

            addEdge: (edge) =>
                set((state) => {
                    if (state.currentProject) {
                        state.currentProject.edges.push(edge);
                        state.currentProject.updatedAt = new Date();
                    }
                }),

            deleteEdge: (edgeId) =>
                set((state) => {
                    if (state.currentProject) {
                        state.currentProject.edges = state.currentProject.edges.filter(
                            (e) => e.id !== edgeId
                        );
                        state.currentProject.updatedAt = new Date();
                    }
                }),

            onNodesChange: (changes) =>
                set((state) => {
                    if (state.currentProject) {
                        state.currentProject.nodes = applyNodeChanges(changes, state.currentProject.nodes) as ComponentNode[];
                        state.currentProject.updatedAt = new Date();
                    }
                }),

            onEdgesChange: (changes) =>
                set((state) => {
                    if (state.currentProject) {
                        state.currentProject.edges = applyEdgeChanges(changes, state.currentProject.edges) as ComponentEdge[];
                        state.currentProject.updatedAt = new Date();
                    }
                }),

            reset: () =>
                set((state) => {
                    state.currentProject = null;
                    state.selectedNode = null;
                    state.isLoading = false;
                }),
        })),
        {
            name: 'vibe-project-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                currentProject: state.currentProject,
                projects: state.projects,
                globalAIConfig: state.globalAIConfig // Persist AI Config
            }),
        }
    )
);
