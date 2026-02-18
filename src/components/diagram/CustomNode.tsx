import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ComponentData } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, FileCode, Globe, Server, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

const getIcon = (type: ComponentData['type']) => {
    switch (type) {
        case 'page':
            return <Globe className="w-4 h-4" />;
        case 'component':
            return <Layers className="w-4 h-4" />;
        case 'api':
            return <Server className="w-4 h-4" />;
        case 'database':
            return <Database className="w-4 h-4" />;
        default:
            return <FileCode className="w-4 h-4" />;
    }
};

const getColorStyles = (type: ComponentData['type']) => {
    switch (type) {
        case 'page':
            return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20';
        case 'component':
            return 'border-green-500 bg-green-50 dark:bg-green-950/20';
        case 'api':
            return 'border-orange-500 bg-orange-50 dark:bg-orange-950/20';
        case 'database':
            return 'border-purple-500 bg-purple-50 dark:bg-purple-950/20';
        default:
            return 'border-gray-500 bg-gray-50';
    }
};

const CustomNode = ({ data, selected }: NodeProps<ComponentData>) => {
    return (
        <div className="relative group">
            {/* Target Handle (Input) */}
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 bg-muted-foreground border-2 border-background"
            />

            <Card
                className={cn(
                    'w-64 border-2 shadow-sm transition-all duration-200',
                    getColorStyles(data.type),
                    selected ? 'ring-2 ring-primary ring-offset-2' : 'hover:shadow-md'
                )}
            >
                <CardHeader className="p-3 pb-2 flex flex-row items-center gap-2 space-y-0 border-b border-black/5 dark:border-white/5">
                    <div className={cn(
                        "p-1.5 rounded-md text-white",
                        data.type === 'page' ? 'bg-blue-500' :
                            data.type === 'component' ? 'bg-green-500' :
                                data.type === 'api' ? 'bg-orange-500' :
                                    'bg-purple-500'
                    )}>
                        {getIcon(data.type)}
                    </div>
                    <CardTitle className="text-sm font-bold truncate">
                        {data.label}
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-3 pt-2">
                    <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5em] mb-2">
                        {data.description || "설명이 없습니다."}
                    </p>

                    <div className="flex flex-wrap gap-1">
                        {data.techSpec?.framework && (
                            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5">
                                {data.techSpec.framework}
                            </Badge>
                        )}
                        {data.techSpec?.stateManagement && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 bg-background/50">
                                {data.techSpec.stateManagement}
                            </Badge>
                        )}
                        {data.type === 'api' && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 bg-background/50">
                                API
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Source Handle (Output) */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 bg-muted-foreground border-2 border-background"
            />
        </div>
    );
};

export default memo(CustomNode);
