'use client';

import React, { useState, useEffect } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { ComponentNode } from '@/types';
import { toast } from 'sonner';

export default function PromptGenerator() {
    const { selectedNode, currentProject } = useProjectStore();
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setPrompt('');
        setError(null);
    }, [selectedNode]);

    const handleGeneratePrompt = async () => {
        if (!selectedNode || !currentProject) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/generate-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    component: selectedNode,
                    project: currentProject,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || '실패');
            setPrompt(data.prompt);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!selectedNode) return null;

    return (
        <Card className="flex flex-col h-full border-none shadow-none rounded-none w-full bg-transparent">
            <CardHeader className="pb-3 px-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-500" /> AI 프롬프트 생성
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px]">{selectedNode.data.type}</Badge>
                </div>
            </CardHeader>

            <CardContent className="flex-1 min-h-0 flex flex-col gap-4 px-4 pb-2">
                {error && (
                    <div className="p-2 text-xs text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-md flex items-center gap-2">
                        <AlertCircle className="w-3 h-3" /> {error}
                    </div>
                )}

                <div className="relative flex-1">
                    <Textarea
                        className="h-full min-h-[200px] resize-none font-mono text-[11px] bg-background/50"
                        placeholder="프롬프트를 생성하면 여기에 표시됩니다."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        readOnly={isLoading}
                    />
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="flex gap-2 pt-0 px-4 pb-4">
                <Button
                    onClick={handleGeneratePrompt}
                    disabled={isLoading}
                    className="w-full text-xs h-8"
                    variant={prompt ? "outline" : "default"}
                >
                    {isLoading ? "생성 중..." : prompt ? "재생성" : "프롬프트 생성"}
                </Button>
            </CardFooter>
        </Card>
    );
}
