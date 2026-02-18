'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Check, Copy } from 'lucide-react';

interface PromptExporterProps {
    prompt: string;
    componentName: string;
    filePath: string;
}

export function PromptExporter({
    prompt,
    componentName,
    filePath
}: PromptExporterProps) {
    const [copied, setCopied] = useState(false)

    const copyToCursor = async () => {
        // Cursor 최적화 포맷
        const cursorPrompt = `
@Codebase

다음 컴포넌트를 구현해주세요:

컴포넌트: ${componentName}
파일 위치: ${filePath}

${prompt}

위 명세에 따라 완성된 코드를 작성해주세요.
현재 프로젝트의 기존 패턴과 일관성을 유지해주세요.
    `.trim()

        await navigator.clipboard.writeText(cursorPrompt)
        setCopied(true)

        toast.success('Cursor용 프롬프트 복사 완료!', {
            description: 'Cmd+K를 눌러 Cursor에 붙여넣으세요',
            action: {
                label: 'Cursor 열기',
                onClick: () => {
                    // cursor:// 프로토콜로 Cursor 자동 실행
                    window.open('cursor://', '_blank')
                }
            }
        })

        setTimeout(() => setCopied(false), 2000)
    }

    const copyToWindsurf = async () => {
        const windsurfPrompt = `
#project

${prompt}

파일: ${filePath}
    `.trim()

        await navigator.clipboard.writeText(windsurfPrompt)
        toast.success('Windsurf용 프롬프트 복사 완료!')
    }

    return (
        <div className="space-y-3 p-4 border rounded-lg bg-muted/20 mt-4">
            <h3 className="font-semibold text-sm">AI IDE로 내보내기</h3>

            <div className="grid grid-cols-2 gap-2">
                <Button
                    onClick={copyToCursor}
                    variant="outline"
                    className="w-full"
                >
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    Cursor로 복사
                </Button>

                <Button
                    onClick={copyToWindsurf}
                    variant="outline"
                    className="w-full"
                >
                    <Copy className="w-4 h-4 mr-2" />
                    Windsurf로 복사
                </Button>
            </div>

            <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer hover:underline">사용 방법</summary>
                <div className="mt-2 space-y-1 p-2 bg-muted/50 rounded">
                    <p><strong>Cursor:</strong> Cmd+K → Cmd+V → Enter</p>
                    <p><strong>Windsurf:</strong> Cascade 모드에서 붙여넣기</p>
                </div>
            </details>
        </div>
    )
}
