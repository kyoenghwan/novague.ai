'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Component, FileText, Database, Server } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/store/projectStore';

// 노드 타입 정의
const nodeTypes = [
    { type: 'page', label: 'Page', icon: FileText, description: 'Route / Page Component', color: 'bg-blue-500' },
    { type: 'component', label: 'Component', icon: Component, description: 'Reusable UI Component', color: 'bg-green-500' },
    { type: 'api', label: 'API', icon: Server, description: 'Simulated API Endpoint & Fetch', color: 'bg-orange-500' },
    { type: 'database', label: 'Database', icon: Database, description: 'Data Schema / Table', color: 'bg-purple-500' },
];

export default function Sidebar() {
    const { projects, currentProject, setCurrentProject, createProject } = useProjectStore();

    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="w-64 border-r border-border bg-muted/10 flex flex-col h-full overflow-hidden">
            {/* 노드 팔레트 */}
            <div className="p-4 flex-1 overflow-y-auto">
                <div className="mb-6">
                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground px-1">Components</h3>
                    <div className="grid gap-2">
                        {nodeTypes.map((item) => (
                            <div
                                key={item.type}
                                className="group flex items-center gap-3 p-3 rounded-md border border-border bg-card hover:border-primary/50 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all"
                                draggable
                                onDragStart={(event) => onDragStart(event, item.type)}
                            >
                                <div className={cn("p-2 rounded text-white", item.color)}>
                                    <item.icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium leading-none mb-1">{item.label}</div>
                                    <div className="text-[10px] text-muted-foreground">{item.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 프로젝트 목록 (간략) */}
                <div>
                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground px-1">Projects</h3>
                    <div className="space-y-1">
                        {projects.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setCurrentProject(p)}
                                className={cn(
                                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                                    currentProject?.id === p.id
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "hover:bg-muted text-muted-foreground"
                                )}
                            >
                                {p.name}
                            </button>
                        ))}
                        <button
                            onClick={() => createProject("New Project", "New Description", ["React"])}
                            className="w-full text-left px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted opacity-70 hover:opacity-100 italic"
                        >
                            + New Project
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-border bg-background/50">
                <p className="text-[10px] text-center text-muted-foreground">
                    Drag items to canvas to add
                </p>
            </div>
        </aside>
    );
}
