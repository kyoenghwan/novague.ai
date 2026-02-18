'use client';

import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    NodeTypes,
    Panel,
    Connection,
    addEdge as flowAddEdge,
    useNodesState,
    useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
// Note: We already imported styles in globals.css, but sometimes it's good to keep it if CSS extraction fails. 
// However, since we did it globally, we can omit it here or keep it for safety.

import { useProjectStore } from '@/store/projectStore';
import CustomNode from './diagram/CustomNode';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ComponentNode } from '@/types';

// 커스텀 노드 타입 등록
const nodeTypes: NodeTypes = {
    custom: CustomNode,
};

const ProjectDiagram = () => {
    // Zustand Store에서 상태와 액션 가져오기
    const {
        currentProject,
        onNodesChange: storeOnNodesChange,
        onEdgesChange: storeOnEdgesChange,
        addEdge: storeAddEdge,
        setSelectedNode,
        addNode,
    } = useProjectStore();

    const nodes = currentProject?.nodes || [];
    const edges = currentProject?.edges || [];

    const onConnect = useCallback(
        (params: Connection) => {
            // React Flow의 addEdge 유틸리티를 사용하여 연결 (ID 생성 등 처리)
            // 여기서는 store의 addEdge를 호출해야 함.
            // storeAddEdge는 ComponentEdge를 받으므로, params를 변환해야 함.
            const newEdge = {
                ...params,
                id: `e${params.source}-${params.target}-${Date.now()}`,
                type: 'default', // 기본 엣지 타입, 필요시 커스텀 가능
            } as any; // 타입 호환성 위해 any 사용 또는 변환 로직 강화 필요
            storeAddEdge(newEdge);
        },
        [storeAddEdge]
    );

    const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
        setSelectedNode(node);
    }, [setSelectedNode]);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, [setSelectedNode]);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');

            if (typeof type === 'undefined' || !type) {
                return;
            }

            // 임시: 마우스 위치 기반 배치 (오차 있음)
            const position = { x: event.clientX - 300, y: event.clientY - 100 };

            const newNode: ComponentNode = {
                id: crypto.randomUUID(),
                type: 'custom',
                position,
                data: {
                    label: `New ${type}`,
                    type: type as any,
                    description: `A new ${type} node.`,
                    requirements: [],
                    techSpec: { framework: 'React', styling: 'Tailwind', stateManagement: 'None' },
                    filePath: '',
                },
            };

            addNode(newNode);
        },
        [addNode]
    );

    // 테스트용 노드 추가 (나중에 DnD로 대체)
    const handleAddNode = () => {
        const newNode: ComponentNode = {
            id: crypto.randomUUID(),
            type: 'custom',
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            data: {
                label: '새 컴포넌트',
                type: 'component',
                description: '새로 생성된 컴포넌트입니다.',
                requirements: [],
                techSpec: { framework: 'React', styling: 'Tailwind', stateManagement: 'None' },
                filePath: '',
            },
        };
        addNode(newNode);
    };

    if (!currentProject) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                프로젝트를 선택하거나 생성해주세요.
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-slate-50 dark:bg-slate-900/50">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={storeOnNodesChange}
                onEdgesChange={storeOnEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onDragOver={onDragOver}
                onDrop={onDrop}
                nodeTypes={nodeTypes}
                fitView
                className="bg-slate-50 dark:bg-slate-900"
            >
                <Background gap={16} size={1} />
                <Controls />
                <MiniMap zoomable pannable className="!bg-background !border-border" />

                <Panel position="top-right" className="flex gap-2">
                    <Button onClick={handleAddNode} size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        노드 추가 (Test)
                    </Button>
                </Panel>
            </ReactFlow>
        </div>
    );
};

export default ProjectDiagram;
