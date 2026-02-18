'use client';

import React, { useState, useEffect } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComponentNode } from '@/types';
import { PromptExporter } from '@/components/PromptExporter';

/**
 * 프롬프트 생성기 UI 컴포넌트
 * 선택된 노드의 정보를 바탕으로 AI 프롬프트를 생성하고 표시합니다.
 */
export default function PromptGenerator() {
    const { selectedNode, currentProject } = useProjectStore();
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    // 선택된 노드가 변경되면 상태 초기화
    useEffect(() => {
        setPrompt('');
        setError(null);
        setIsCopied(false);
    }, [selectedNode]);

    // 프롬프트 생성 핸들러
    const handleGeneratePrompt = async () => {
        if (!selectedNode || !currentProject) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/generate-prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    component: selectedNode,
                    project: currentProject,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '프롬프트 생성에 실패했습니다.');
            }

            setPrompt(data.prompt);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 클립보드 복사 핸들러
    const handleCopy = async () => {
        if (!prompt) return;

        try {
            await navigator.clipboard.writeText(prompt);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000); // 2초 후 복사 상태 리셋
        } catch (err) {
            console.error('Failed to copy code: ', err);
            setError('클립보드 복사에 실패했습니다.');
        }
    };

    if (!selectedNode) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground bg-slate-50/50 dark:bg-slate-900/50 border rounded-lg">
                <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                <h3 className="text-lg font-semibold">선택된 컴포넌트 없음</h3>
                <p className="text-sm">다이어그램에서 노드를 선택하여 프롬프트를 생성하세요.</p>
            </div>
        );
    }

    return (
        <Card className="flex flex-col h-full border-none shadow-none rounded-none w-full max-w-md bg-transparent">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        프롬프트 생성
                    </CardTitle>
                    <Badge variant="outline">{selectedNode.data.type}</Badge>
                </div>
                <CardDescription className="truncate">
                    {selectedNode.data.label} ({selectedNode.data.filePath || 'Path not set'})
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 min-h-0 flex flex-col gap-4">
                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-md flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <div className="relative flex-1">
                    <Textarea
                        className="h-full min-h-[300px] resize-none font-mono text-sm bg-background/50"
                        placeholder="프롬프트를 생성하면 여기에 표시됩니다."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        readOnly={isLoading}
                    />
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="flex gap-2 pt-0">
                <Button
                    onClick={handleGeneratePrompt}
                    disabled={isLoading}
                    className="flex-1"
                    variant={prompt ? "outline" : "default"}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            생성 중...
                        </>
                    ) : (
                        <>재생성</>
                    )}
                </Button>
            </CardFooter>

            {prompt && selectedNode && (
                <div className="px-6 pb-6">
                    <PromptExporter
                        prompt={prompt}
                        componentName={selectedNode.data.label}
                        filePath={selectedNode.data.filePath || ''}
                    />
                </div>
            )}
        </Card>
    );
}
