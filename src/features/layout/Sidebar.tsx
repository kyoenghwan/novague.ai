'use client';

import React from 'react';
import { FileText, Database, Layout, Code } from 'lucide-react';
import { cn } from '@/services/common-utils';

const nodeTypes = [
    { type: 'page', label: 'Page', icon: FileText, color: 'bg-blue-500' },
    { type: 'component', label: 'Component', icon: Layout, color: 'bg-purple-500' },
    { type: 'api', label: 'API Endpoint', icon: Code, color: 'bg-green-500' },
    { type: 'database', label: 'Database', icon: Database, color: 'bg-orange-500' },
];

export default function Sidebar() {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="w-64 border-r border-border bg-muted/10 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20">
                <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Node Palette</h2>
                <div className="grid grid-cols-1 gap-2">
                    {nodeTypes.map((item) => (
                        <div key={item.type} className="flex items-center gap-3 p-3 rounded-md border border-border bg-background hover:border-primary/50 cursor-grab" draggable onDragStart={(e) => onDragStart(e, item.type)}>
                            <div className={cn("p-1.5 rounded text-white", item.color)}><item.icon className="w-4 h-4" /></div>
                            <span className="text-sm font-medium">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}
