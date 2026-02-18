'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, MousePointerClick, Square, FileCode, CheckCircle2 } from 'lucide-react';

export function UserGuide() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const hasSeenGuide = localStorage.getItem('vibe-guide-seen');
        if (!hasSeenGuide) {
            setOpen(true);
        }
    }, []);

    const handleClose = () => {
        setOpen(false);
        localStorage.setItem('vibe-guide-seen', 'true');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg bg-background border hover:bg-muted">
                    <HelpCircle className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        Welcome to Vibe Coding Manager 👋
                    </DialogTitle>
                    <DialogDescription>
                        AI 코딩 도구를 위한 완벽한 프롬프트 설계 도구입니다.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex items-start gap-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                            <MousePointerClick className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold">1. 드래그 앤 드롭으로 설계</h4>
                            <p className="text-sm text-muted-foreground">
                                왼쪽 사이드바에서 Page, Component, API 노드를 캔버스로 드래그하여 배치하세요.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                            <Square className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold">2. 노드 선택 및 상세 정의</h4>
                            <p className="text-sm text-muted-foreground">
                                노드를 클릭하여 우측 패널에서 상세 명세를 확인하고, 관계를 연결하세요.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                            <FileCode className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold">3. 프롬프트 생성</h4>
                            <p className="text-sm text-muted-foreground">
                                우측 패널의 'Prompt Generator'에서 최적화된 프롬프트를 복사하여 Cursor나 Windsurf에 붙여넣으세요.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold">4. 자동 저장</h4>
                            <p className="text-sm text-muted-foreground">
                                로그인하면 프로젝트가 클라우드(Supabase)에 5초마다 자동 저장됩니다.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleClose} className="w-full">
                        시작하기!
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
