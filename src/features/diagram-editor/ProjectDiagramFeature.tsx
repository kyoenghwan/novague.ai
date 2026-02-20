'use client';

import React, { useCallback } from 'react';
import ReactFlow, { Background, Controls, MiniMap, NodeTypes, Connection } from 'reactflow';
import 'reactflow/dist/style.css';
import { useProjectStore } from '@/store/projectStore';
import CustomNode from './CustomNode';
import { ComponentNode } from '@/types';

const nodeTypes: NodeTypes = { custom: CustomNode };

export default function ProjectDiagram() {
    const { currentProject, onNodesChange, onEdgesChange, addEdge, setSelectedNode, addNode } = useProjectStore();

    const onConnect = useCallback((params: Connection) => {
        addEdge({ ...params, id: `e${Date.now()}`, type: 'default', markerEnd: { type: 'arrowclosed' } } as any);
    }, [addEdge]);

    const onDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        const type = event.dataTransfer.getData('application/reactflow');
        if (!type) return;
        const newNode: ComponentNode = {
            id: crypto.randomUUID(), type: 'custom', position: { x: event.clientX - 400, y: event.clientY - 150 },
            data: { label: `New ${type}`, type: type as any, description: '', requirements: [], techSpec: { framework: 'React', styling: 'Tailwind', stateManagement: 'None' }, filePath: '' }
        };
        addNode(newNode);
    }, [addNode]);

    if (!currentProject) return null;

    return (
        <div className="w-full h-full bg-slate-50 dark:bg-slate-950/20" onDragOver={e => e.preventDefault()} onDrop={onDrop}>
            <ReactFlow nodes={currentProject.nodes} edges={currentProject.edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={(_, n) => setSelectedNode(n)} onPaneClick={() => setSelectedNode(null)} nodeTypes={nodeTypes} fitView>
                <Background gap={20} size={1} /><Controls /><MiniMap className="!bg-background !border-border" />
            </ReactFlow>
        </div>
    );
}
