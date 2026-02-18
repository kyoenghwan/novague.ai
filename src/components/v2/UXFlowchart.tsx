'use client';

import React, { useMemo } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Background,
    Controls,
    MiniMap,
    ConnectionLineType,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ScreenAnalysis, Screen } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitBranch, Smartphone, Zap, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface UXFlowchartProps {
    analysis: ScreenAnalysis;
    onApprove: () => void;
    onModify: () => void;
}

export default function UXFlowchart({ analysis, onApprove, onModify }: UXFlowchartProps) {
    // 1. Convert ScreenAnalysis to React Flow Nodes/Edges
    const { nodes, edges } = useMemo(() => {
        const layoutNodes: Node[] = [];
        const layoutEdges: Edge[] = [];

        let x = 100;
        let y = 100;
        const spacingX = 250;
        const spacingY = 150;

        // Simple layout logic (can be replaced with dagre later)
        analysis.screens.forEach((screen, index) => {
            const isRowBreak = index > 0 && index % 4 === 0;
            if (isRowBreak) {
                x = 100;
                y += spacingY;
            }

            layoutNodes.push({
                id: screen.id,
                position: { x, y },
                data: { label: screen.name, type: screen.type, route: screen.route },
                style: {
                    border: '1px solid #777',
                    borderRadius: '8px',
                    padding: '10px',
                    background: screen.type === 'page' ? '#fff' : '#f0f9ff',
                    color: '#333',
                    minWidth: '150px',
                    textAlign: 'center'
                },
                type: 'default', // basic node for now
            });

            x += spacingX;
        });

        // Flows to Edges
        analysis.userFlows.forEach((flow) => {
            flow.steps.forEach((step, idx) => {
                layoutEdges.push({
                    id: `e-${flow.id}-${idx}`,
                    source: step.screen,
                    target: step.nextScreen,
                    label: step.action,
                    type: 'smoothstep',
                    animated: true,
                    markerEnd: { type: MarkerType.ArrowClosed },
                    style: { stroke: '#888' },
                    labelStyle: { fill: '#555', fontWeight: 700 }
                });
            });
        });

        return { nodes: layoutNodes, edges: layoutEdges };
    }, [analysis]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-full w-full"
        >
            <div className="flex-none p-4 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <GitBranch className="h-5 w-5 text-indigo-500" />
                            UX Flow & Structure
                        </h2>
                        <p className="text-sm text-muted-foreground">AI Architect defined {analysis.screens.length} screens and {analysis.userFlows.length} flows.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onModify}>디자인 수정</Button>
                        <Button onClick={onApprove} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            UX 승인 및 다음 단계
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden p-4 gap-4">
                {/* Flowchart Canvas */}
                <div className="flex-1 border rounded-xl overflow-hidden shadow-sm bg-slate-50 dark:bg-slate-900/50">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        fitView
                        attributionPosition="bottom-right"
                    >
                        <Background gap={16} />
                        <Controls />
                        <MiniMap style={{ height: 100 }} zoomable pannable />
                    </ReactFlow>
                </div>

                {/* Info Panel */}
                <Card className="w-80 flex flex-col shadow-md h-full">
                    <Tabs defaultValue="screens" className="w-full h-full flex flex-col">
                        <div className="p-4 pb-0">
                            <TabsList className="w-full grid grid-cols-2">
                                <TabsTrigger value="screens">Screens</TabsTrigger>
                                <TabsTrigger value="background">Background</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="screens" className="flex-1 overflow-y-auto p-4 space-y-3">
                            {analysis.screens.map(screen => (
                                <div key={screen.id} className="p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors cursor-pointer group">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="font-medium text-sm">{screen.name}</div>
                                        <Badge variant="secondary" className="text-[10px] h-5">{screen.type}</Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground font-mono mb-2">{screen.route}</div>
                                    <div className="flex flex-wrap gap-1">
                                        {screen.authentication !== 'public' && (
                                            <Badge variant="outline" className="text-[10px] text-orange-500 border-orange-200">Auth</Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </TabsContent>

                        <TabsContent value="background" className="flex-1 overflow-y-auto p-4 space-y-3">
                            {analysis.backgroundProcesses.map((proc) => (
                                <div key={proc.id} className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Zap className="h-4 w-4 text-yellow-500" />
                                        <div className="font-medium text-sm">{proc.name}</div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2">{proc.description}</p>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-primary">{proc.type}</span>
                                        <span className="text-muted-foreground">via {proc.trigger}</span>
                                    </div>
                                </div>
                            ))}
                            {analysis.backgroundProcesses.length === 0 && (
                                <div className="text-center text-muted-foreground text-sm py-4">
                                    No background processes defined.
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>
        </motion.div>
    );
}
