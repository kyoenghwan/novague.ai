'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';

import { ProjectAnalysis, ScreenAnalysis, DataArchitecture, ComponentArchitecture, ValidationResult } from '@/types';
import { generateVisualization, ViewMode } from '@/lib/ai/visualizationEngine';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Layout,
    Network,
    Workflow,
    Database,
    Layers,
    MessageSquare,
    CheckCircle2,
    Code2,
    FileText,
    Zap,
    Download
} from 'lucide-react';

interface VisualizationEngineProps {
    projectAnalysis: ProjectAnalysis;
    uxAnalysis: ScreenAnalysis;
    dataArchitecture: DataArchitecture;
    componentArchitecture: ComponentArchitecture;
    validationResult: ValidationResult;
    onReset: () => void;
}

export default function VisualizationEngine(props: VisualizationEngineProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('architecture');
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    // Initial Layout Generation
    useEffect(() => {
        const { nodes: newNodes, edges: newEdges } = generateVisualization(
            viewMode,
            props.projectAnalysis,
            props.uxAnalysis,
            props.dataArchitecture,
            props.componentArchitecture
        );
        setNodes(newNodes);
        setEdges(newEdges);
        setSelectedNode(null);
    }, [viewMode, props]);

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, []);

    // Helper to get Node Details
    const renderNodeDetails = () => {
        if (!selectedNode) return <div className="text-muted-foreground text-sm text-center p-4">Select a node to view details.</div>;

        return (
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-bold">{selectedNode.data.label}</h3>
                    <Badge variant="outline" className="mt-1">{selectedNode.type || 'Default Node'}</Badge>
                </div>
                <div className="text-sm border p-3 rounded bg-muted/20">
                    <p className="font-mono text-xs">{selectedNode.id}</p>
                    {/* Mock details - in real app, map ID back to actual object */}
                    <p className="mt-2 text-muted-foreground">
                        This node represents a key architectural element.
                        Use the "Generate Prompt" button below to create code implementation prompts for this specific component.
                    </p>
                </div>

                <Button className="w-full gap-2" variant="secondary">
                    <Zap className="h-4 w-4" /> Generate Prompt
                </Button>
            </div>
        );
    };

    return (
        <div className="flex h-full w-full bg-background overflow-hidden">
            {/* Left Panel: Progress & Chat (30%) */}
            <aside className="w-[300px] border-r flex flex-col bg-muted/5">
                <div className="p-4 border-b">
                    <h2 className="font-bold flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" /> Vibe Assistant
                    </h2>
                </div>
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {/* Progress Log */}
                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase">Pipeline Log</h3>
                            {[
                                { step: 'Analysis', status: 'Completed', time: '30ms' },
                                { step: 'UX Design', status: 'Completed', time: '45ms' },
                                { step: 'Data Arch', status: 'Completed', time: '60ms' },
                                { step: 'Components', status: 'Completed', time: '90ms' },
                                { step: 'Validation', status: 'Passed', time: '30ms' },
                            ].map((log, i) => (
                                <div key={i} className="flex items-center justify-between text-sm p-2 bg-card border rounded shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                                        <span>{log.step}</span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">{log.time}</span>
                                </div>
                            ))}
                        </div>

                        {/* Mock Chat Bubble */}
                        <div className="bg-primary/10 p-3 rounded-lg text-sm">
                            <p className="font-medium text-primary mb-1">AI Architect</p>
                            <p>
                                I've generated the complete architecture for <strong>{props.projectAnalysis.projectName}</strong>.
                                You can switch between views in the center panel to explore different aspects of the system.
                            </p>
                        </div>
                    </div>
                </ScrollArea>
                <div className="p-4 border-t">
                    <Button variant="outline" className="w-full" onClick={props.onReset}>Start New Project</Button>
                </div>
            </aside>

            {/* Center Panel: Visualization Canvas (45% -> Flex 1) */}
            <main className="flex-1 flex flex-col relative bg-slate-50 dark:bg-slate-950/50">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-background/90 backdrop-blur border rounded-full p-1 shadow-md flex gap-1">
                    <ViewModeButton mode="architecture" current={viewMode} set={setViewMode} icon={Layout} label="Architecture" />
                    <ViewModeButton mode="userFlow" current={viewMode} set={setViewMode} icon={Workflow} label="User Flow" />
                    <ViewModeButton mode="component" current={viewMode} set={setViewMode} icon={Layers} label="Components" />
                    <ViewModeButton mode="dataFlow" current={viewMode} set={setViewMode} icon={Database} label="Data Flow" />
                    <ViewModeButton mode="dependency" current={viewMode} set={setViewMode} icon={Network} label="Dependency" />
                </div>

                <ReactFlowProvider>
                    <div className="flex-1 h-full w-full">
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onNodeClick={onNodeClick}
                            fitView
                            attributionPosition="bottom-right"
                        >
                            <Controls position="bottom-left" />
                            <Background gap={12} size={1} />
                        </ReactFlow>
                    </div>
                </ReactFlowProvider>
            </main>

            {/* Right Panel: Spec View (25%) */}
            <aside className="w-[350px] border-l flex flex-col bg-background">
                <div className="p-4 border-b">
                    <h2 className="font-bold flex items-center gap-2">
                        <FileText className="h-5 w-5" /> Specification
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    {selectedNode ? renderNodeDetails() : (
                        <div className="space-y-6">
                            {/* Project Summary if no node selected */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold">Project Summary</h3>
                                <div className="p-3 bg-muted/30 rounded border text-sm">
                                    <p className="font-medium">{props.projectAnalysis.projectName}</p>
                                    <p className="text-muted-foreground mt-1 text-xs">{props.projectAnalysis.summary}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold">Tech Stack</h3>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary">{props.projectAnalysis.techStack.frontend.framework}</Badge>
                                    <Badge variant="secondary">{props.projectAnalysis.techStack.backend.platform}</Badge>
                                    <Badge variant="secondary">{props.projectAnalysis.techStack.backend.database}</Badge>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <h3 className="text-sm font-semibold mb-2">Export Actions</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" size="sm" className="w-full">
                                        <Code2 className="h-3 w-3 mr-2" /> JSON
                                    </Button>
                                    <Button variant="outline" size="sm" className="w-full">
                                        <Download className="h-3 w-3 mr-2" /> PDF Report
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
}

function ViewModeButton({ mode, current, set, icon: Icon, label }: { mode: ViewMode, current: ViewMode, set: (m: ViewMode) => void, icon: any, label: string }) {
    return (
        <Button
            variant={current === mode ? "secondary" : "ghost"}
            size="sm"
            onClick={() => set(mode)}
            className={`rounded-full px-3 gap-2 ${current === mode ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground'}`}
        >
            <Icon className="h-4 w-4" />
            <span className="hidden xl:inline text-xs">{label}</span>
        </Button>
    )
}
