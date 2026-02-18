'use client';

import React from 'react';
import PromptGenerator from '@/components/PromptGenerator';
import { useProjectStore } from '@/store/projectStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, Rocket } from 'lucide-react';

export default function RightPanel() {
    const { selectedNode, currentProject } = useProjectStore();

    if (selectedNode) {
        return (
            <aside className="w-80 border-l border-border bg-background flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/10">
                    <h2 className="font-semibold text-sm">Properties</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <PromptGenerator />
                    {/* 추후 여기에 노드 속성 편집 폼 추가 가능 */}
                </div>
            </aside>
        );
    }

    return (
        <aside className="w-80 border-l border-border bg-muted/5 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/10">
                <h2 className="font-semibold text-sm">Project Info</h2>
            </div>
            <div className="flex-1 p-6 flex flex-col gap-6">
                {currentProject ? (
                    <>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Rocket className="w-5 h-5 text-primary" />
                                    {currentProject.name}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {currentProject.description || "No description"}
                                </p>
                            </div>

                            <div>
                                <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Tech Stack</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {currentProject.techStack.map(tech => (
                                        <Badge key={tech} variant="outline" className="text-xs">
                                            {tech}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <BookOpen className="w-3 h-3" /> Nodes
                                    </div>
                                    <div className="text-2xl font-bold">
                                        {currentProject.nodes.length}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> Created
                                    </div>
                                    <div className="text-xs font-medium">
                                        {currentProject.createdAt ? new Date(currentProject.createdAt).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 shadow-sm mt-auto">
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm text-blue-700 dark:text-blue-300">Tip</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 text-xs text-blue-600 dark:text-blue-400">
                                왼쪽 팔레트에서 컴포넌트를 드래그하여 캔버스에 추가하세요. 노드를 클릭하면 이 패널에서 속성을 편집할 수 있습니다.
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        No Project Selected
                    </div>
                )}
            </div>
        </aside>
    );
}
