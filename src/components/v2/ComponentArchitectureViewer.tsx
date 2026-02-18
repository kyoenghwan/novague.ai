'use client';

import React, { useState } from 'react';
import { ComponentArchitecture, ScreenComponents, Component, SharedComponent } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    LayoutTemplate,
    Box,
    Layers,
    FileCode,
    CheckCircle2,
    ChevronRight,
    Package,
    Share2,
    Code2,
    Boxes
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ComponentArchitectureViewerProps {
    architecture: ComponentArchitecture;
    onApprove: () => void;
    onModify: () => void;
}

export default function ComponentArchitectureViewer({ architecture, onApprove, onModify }: ComponentArchitectureViewerProps) {
    const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
    const [selectedScreenId, setSelectedScreenId] = useState<string>(architecture.screens[0]?.screenId);

    const currentScreen = architecture.screens.find(s => s.screenId === selectedScreenId);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-full w-full p-4 gap-4"
        >
            <div className="flex-none flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Boxes className="h-5 w-5 text-green-600" />
                        Component Architecture
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Breakdown of screens into modular components.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onModify}>Modify Designs</Button>
                    <Button onClick={onApprove} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Finalize Architecture
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex gap-4">
                {/* Left Panel: Component Tree */}
                <Card className="w-1/3 flex flex-col shadow-md border-green-100 dark:border-green-900/30">
                    <div className="p-4 border-b bg-green-50/30 dark:bg-green-950/20">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {architecture.screens.map(screen => (
                                <Button
                                    key={screen.screenId}
                                    variant={selectedScreenId === screen.screenId ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedScreenId(screen.screenId)}
                                    className={selectedScreenId === screen.screenId ? "bg-green-600 hover:bg-green-700" : ""}
                                >
                                    {screen.screenId}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                        {currentScreen && (
                            <div className="space-y-6">
                                {/* Layout Section */}
                                <div>
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <LayoutTemplate className="h-3 w-3" /> Layout
                                    </h3>
                                    <div className="p-3 border border-dashed rounded-lg bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded">
                                            <LayoutTemplate className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">{currentScreen.layout.name}</div>
                                            <div className="text-[10px] text-muted-foreground font-mono">{currentScreen.layout.filePath}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Feature Components */}
                                <div>
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <Layers className="h-3 w-3" /> Features
                                    </h3>
                                    <div className="space-y-2">
                                        {currentScreen.featComponents.map(comp => (
                                            <ComponentItem
                                                key={comp.id}
                                                component={comp}
                                                isSelected={selectedComponent?.id === comp.id}
                                                onClick={() => setSelectedComponent(comp)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* UI Components */}
                                <div>
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <Box className="h-3 w-3" /> Local UI
                                    </h3>
                                    <div className="space-y-2">
                                        {currentScreen.uiComponents.map(comp => (
                                            <ComponentItem
                                                key={comp.id}
                                                component={comp}
                                                isSelected={selectedComponent?.id === comp.id}
                                                onClick={() => setSelectedComponent(comp)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Shared Components Section */}
                        <div className="mt-8 pt-6 border-t">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
                                <Share2 className="h-3 w-3" /> Shared Library
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {architecture.sharedComponents.map(comp => (
                                    <div
                                        key={comp.id}
                                        onClick={() => setSelectedComponent(comp)}
                                        className={`p-2 border rounded-md cursor-pointer transition-all ${selectedComponent?.id === comp.id ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950/30' : 'hover:bg-muted'}`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <Package className="h-3 w-3 text-orange-500" />
                                            <span className="text-xs font-medium">{comp.name}</span>
                                        </div>
                                        <Badge variant="secondary" className="text-[9px] h-4">Used {comp.usageCount}x</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollArea>
                </Card>

                {/* Right Panel: Component Details */}
                <div className="flex-1 flex flex-col h-full rounded-xl border bg-card shadow-sm overflow-hidden">
                    {selectedComponent ? (
                        <>
                            <div className="p-6 border-b bg-muted/5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-2xl font-bold">{selectedComponent.name}</h2>
                                            <Badge className={
                                                selectedComponent.type === 'feature' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' :
                                                    selectedComponent.type === 'ui' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-700'
                                            }>
                                                {selectedComponent.type}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                                            <FileCode className="h-4 w-4" />
                                            {selectedComponent.filePath}
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-4 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border">
                                    {selectedComponent.description}
                                </p>
                            </div>

                            <Tabs defaultValue="specs" className="flex-1 flex flex-col overflow-hidden">
                                <div className="px-6 pt-4">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="specs">Props & State</TabsTrigger>
                                        <TabsTrigger value="deps">Dependencies</TabsTrigger>
                                        <TabsTrigger value="tests">Test & Style</TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="specs" className="flex-1 overflow-y-auto p-6 space-y-6">
                                    <div>
                                        <h4 className="text-sm font-semibold mb-3">Props Definition</h4>
                                        <div className="border rounded-md divide-y">
                                            {selectedComponent.props.length === 0 && <div className="p-3 text-sm text-muted-foreground">No specific props defined.</div>}
                                            {selectedComponent.props.map((prop, idx) => (
                                                <div key={idx} className="p-3 flex items-center justify-between">
                                                    <div>
                                                        <div className="font-mono text-sm font-medium flex items-center gap-2">
                                                            {prop.name}
                                                            {prop.required && <span className="text-red-500 text-[10px] border border-red-200 bg-red-50 px-1 rounded">REQ</span>}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">{prop.description}</div>
                                                    </div>
                                                    <div className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-muted-foreground">
                                                        {prop.type}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-semibold mb-3">Internal State</h4>
                                        <div className="border rounded-md divide-y">
                                            {selectedComponent.state.length === 0 && <div className="p-3 text-sm text-muted-foreground">Stateless component.</div>}
                                            {selectedComponent.state.map((st, idx) => (
                                                <div key={idx} className="p-3">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-mono text-sm font-semibold text-orange-600 dark:text-orange-400">{st.name}</span>
                                                        <span className="text-xs font-mono text-muted-foreground">Initial: {JSON.stringify(st.initialValue)}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">{st.description}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="deps" className="flex-1 p-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                            <h4 className="text-sm font-semibold mb-2">Used Components</h4>
                                            {selectedComponent.dependencies.components.length === 0 ? (
                                                <span className="text-xs text-muted-foreground">None</span>
                                            ) : (
                                                <ul className="list-disc list-inside text-sm space-y-1">
                                                    {selectedComponent.dependencies.components.map(c => <li key={c}>{c}</li>)}
                                                </ul>
                                            )}
                                        </div>
                                        <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                            <h4 className="text-sm font-semibold mb-2">Hooks & APIs</h4>
                                            {selectedComponent.dependencies.hooks.length === 0 && selectedComponent.dependencies.apis.length === 0 ? (
                                                <span className="text-xs text-muted-foreground">None</span>
                                            ) : (
                                                <ul className="list-disc list-inside text-sm space-y-1">
                                                    {selectedComponent.dependencies.hooks.map(c => <li key={c} className="text-blue-600 dark:text-blue-400">{c}</li>)}
                                                    {selectedComponent.dependencies.apis.map(c => <li key={c} className="text-green-600 dark:text-green-400">{c}</li>)}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="tests" className="flex-1 p-6">
                                    <div className="space-y-4">
                                        <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 p-4 rounded-lg">
                                            <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-500 mb-2">Test Scenarios</h4>
                                            <ul className="space-y-1">
                                                {selectedComponent.testScenarios.map((scenario, i) => (
                                                    <li key={i} className="text-sm flex items-start gap-2">
                                                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                                        <span className="text-muted-foreground">{scenario}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="secondary" size="sm" className="w-full">
                                                <Code2 className="h-4 w-4 mr-2" /> View Prompt
                                            </Button>
                                            <Button variant="secondary" size="sm" className="w-full">
                                                Generate Doc
                                            </Button>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                            <Boxes className="h-16 w-16 mb-4 opacity-20" />
                            <h3 className="text-lg font-medium text-foreground">Select a Component</h3>
                            <p className="text-sm max-w-[250px] mt-2">
                                Click on any component from the tree on the left to view its detailed architecture and specifications.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function ComponentItem({ component, isSelected, onClick }: { component: Component, isSelected: boolean, onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center gap-3 ${isSelected
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/30 shadow-sm'
                    : 'bg-card hover:bg-muted/50 hover:border-green-300 dark:hover:border-green-800'
                }`}
        >
            <div className={`p-2 rounded-md ${component.type === 'feature' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                    component.type === 'ui' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                {component.type === 'feature' ? <Layers className="h-4 w-4" /> : <Box className="h-4 w-4" />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{component.name}</div>
                <div className="text-[10px] text-muted-foreground truncate">{component.description}</div>
            </div>
            {isSelected && <ChevronRight className="h-4 w-4 text-green-500" />}
        </div>
    )
}
