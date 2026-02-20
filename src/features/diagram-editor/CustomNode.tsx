'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileText, Database, Layout, Code } from 'lucide-react';
import { cn } from '@/services/common-utils';

const iconMap = { page: FileText, component: Layout, api: Code, database: Database };
const colorMap = { page: 'bg-blue-500', component: 'bg-purple-500', api: 'bg-green-500', database: 'bg-orange-500' };

const CustomNode = ({ data, selected }: NodeProps) => {
    const Icon = iconMap[data.type as keyof typeof iconMap] || Layout;
    const color = colorMap[data.type as keyof typeof colorMap] || 'bg-slate-500';
    return (
        <div className={cn("px-4 py-2 shadow-lg rounded-md border-2 bg-background transition-all min-w-[150px]", selected ? "border-primary ring-2 ring-primary/20 scale-105" : "border-border")}>
            <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-primary" />
            <div className="flex items-center gap-3">
                <div className={cn("p-1.5 rounded-sm text-white shadow-inner", color)}><Icon className="w-3.5 h-3.5" /></div>
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">{data.type}</span>
                    <span className="text-xs font-semibold leading-tight">{data.label}</span>
                </div>
            </div>
            <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-primary" />
        </div>
    );
};
export default memo(CustomNode);
