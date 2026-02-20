'use client';

import React from 'react';
import PromptGenerator from '@/features/prompt-engine/PromptGeneratorFeature';
import NodePropertiesEditor from '@/features/diagram-editor/NodePropertiesEditor';
import { useProjectStore } from '@/store/projectStore';
import { Badge } from '@/components/ui/badge';
import { Rocket, Settings2, Sparkles, Layout } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function RightPanel() {
    const { selectedNode, currentProject } = useProjectStore();

    if (selectedNode) {
        return (
            <aside className="w-96 border-l border-border bg-background flex flex-col h-full overflow-hidden shadow-2xl z-40">
                <Tabs defaultValue="props" className="flex flex-col h-full">
                    <div className="p-2 border-b border-border bg-muted/30">
                        <TabsList className="grid w-full grid-cols-2 h-9">
                            <TabsTrigger value="props" className="text-[11px] gap-1.5 font-bold uppercase"><Settings2 className="w-3.5 h-3.5" /> Spec</TabsTrigger>
                            <TabsTrigger value="prompt" className="text-[11px] gap-1.5 font-bold uppercase"><Sparkles className="w-3.5 h-3.5 text-purple-500" /> Prompt</TabsTrigger>
                        </TabsList>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <TabsContent value="props" className="m-0 p-4"><NodePropertiesEditor /></TabsContent>
                        <TabsContent value="prompt" className="m-0 p-0"><PromptGenerator /></TabsContent>
                    </div>
                </Tabs>
            </aside>
        );
    }

    return (
        <aside className="w-96 border-l border-border bg-muted/5 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/10 h-10 flex items-center">
                <h2 className="font-semibold text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Layout className="w-3 h-3" /> Dashboard</h2>
            </div>
            <div className="flex-1 p-6 space-y-6">
                {currentProject && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-black tracking-tighter flex items-center gap-2 uppercase"><Rocket className="w-5 h-5 text-primary" /> {currentProject.name}</h3>
                        <p className="text-xs text-muted-foreground italic">{currentProject.description}</p>
                    </div>
                )}
            </div>
        </aside>
    );
}
