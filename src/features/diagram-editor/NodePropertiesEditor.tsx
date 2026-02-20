'use client';

import React from 'react';
import { useProjectStore } from '@/store/projectStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Layout, Settings2 } from 'lucide-react';

export default function NodePropertiesEditor() {
    const { selectedNode, updateNode } = useProjectStore();
    if (!selectedNode) return null;
    const { data } = selectedNode;

    const handleUpdate = (updates: any) => updateNode(selectedNode.id, updates);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Component Name</Label>
                    <Input value={data.label} onChange={(e) => handleUpdate({ label: e.target.value })} className="h-9 font-semibold bg-background/50" />
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Description</Label>
                    <Textarea value={data.description} onChange={(e) => handleUpdate({ description: e.target.value })} className="text-xs min-h-[80px] bg-muted/20 resize-none" />
                </div>
            </div>

            <Tabs defaultValue="specs" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="specs" className="text-[10px] font-bold">SDD SPECS</TabsTrigger>
                    <TabsTrigger value="tech" className="text-[10px] font-bold">TECH SPEC</TabsTrigger>
                </TabsList>
                <TabsContent value="specs" className="pt-4 space-y-4">
                    {data.type === 'component' || data.type === 'page' ? (
                        <div className="space-y-4">
                            <Label className="text-xs font-bold flex items-center gap-2 uppercase tracking-tighter">
                                <Layout className="w-3.5 h-3.5 text-primary" /> Props Definition
                            </Label>
                            <div className="space-y-2">
                                {(data.interfaces?.props || []).map((p: any, idx: number) => (
                                    <div key={idx} className="flex gap-2 p-2 border rounded-md bg-muted/30">
                                        <Input value={p.name} className="h-7 text-[10px] font-mono" onChange={(e) => {
                                            const props = [...(data.interfaces?.props || [])];
                                            props[idx] = { ...p, name: e.target.value };
                                            handleUpdate({
                                                interfaces: {
                                                    state: [],
                                                    events: [],
                                                    ...data.interfaces,
                                                    props
                                                }
                                            });
                                        }} />
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" size="sm" className="w-full text-[10px] h-7 border-dashed" onClick={() => {
                                const props = data.interfaces?.props || [];
                                const newProps = [...props, { name: 'newProp', type: 'string', description: '', required: true }];
                                handleUpdate({
                                    interfaces: {
                                        state: [],
                                        events: [],
                                        ...data.interfaces,
                                        props: newProps
                                    }
                                });
                            }}>
                                <Plus className="w-3 h-3 mr-1" /> Add Prop
                            </Button>
                        </div>
                    ) : null}
                </TabsContent>
                <TabsContent value="tech" className="pt-4 space-y-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                            <Settings2 className="w-3 h-3" /> File Path
                        </Label>
                        <Input value={data.filePath} onChange={(e) => handleUpdate({ filePath: e.target.value })} placeholder="/src/components/..." className="h-8 text-[11px] font-mono bg-muted/10 border-dashed" />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
