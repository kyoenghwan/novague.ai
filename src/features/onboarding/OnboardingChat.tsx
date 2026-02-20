'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { chatWithArchitect } from '@/services/ai/projectManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
    Send,
    Bot,
    User,
    Sparkles,
    CheckCircle2,
    Layout,
    Box,
    Database,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { cn } from '@/services/common-utils';
import { toast } from 'sonner';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    phase?: 'identity' | 'platform' | 'features' | 'logic';
    suggestedData?: any;
}

export default function OnboardingChat() {
    const { globalAIConfig, currentProject, updateProject } = useProjectStore();
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: '안녕하세요! 당신의 아이디어를 현실로 만들어드릴 수석 제품 설계자입니다. 어떤 프로젝트를 구상 중이신가요?',
            phase: 'identity'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentPhase, setCurrentPhase] = useState<'identity' | 'platform' | 'features' | 'logic'>('identity');
    const scrollRef = useRef<HTMLDivElement>(null);

    // 스크롤 하단 유지
    useEffect(() => {
        const timer = setTimeout(() => {
            if (scrollRef.current) {
                const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
                if (scrollContainer) {
                    scrollContainer.scrollTo({
                        top: scrollContainer.scrollHeight,
                        behavior: 'smooth'
                    });
                }
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [messages, isLoading]);

    const handleSend = async (text: string = input) => {
        if (!text.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            const response = await chatWithArchitect(history, text, globalAIConfig);

            if (response && 'phase' in response) {
                const aiMessage: Message = {
                    role: 'assistant',
                    content: response.message,
                    phase: response.phase as any,
                    suggestedData: response.suggestedData
                };

                setMessages(prev => [...prev, aiMessage]);
                setCurrentPhase(response.phase as any);

                // 프로젝트 정보 업데이트 (선택 사항)
                if (response.refinedIdea) {
                    updateProject({ description: response.refinedIdea });
                }

                if (response.isComplete) {
                    toast.success("제품 설계가 완료되었습니다! 이제 상세 설계를 진행합니다.");
                }
            } else if (response) {
                const aiMessage: Message = {
                    role: 'assistant',
                    content: response.message
                };
                setMessages(prev => [...prev, aiMessage]);
            }
        } catch (error: any) {
            toast.error("AI와 대화 중 오류가 발생했습니다. API 설정을 확인해주세요.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionAction = (action: string) => {
        handleSend(action);
    };

    return (
        <Card className="w-full max-w-3xl mx-auto h-[600px] flex flex-col shadow-xl border-t-4 border-t-primary overflow-hidden bg-background/50 backdrop-blur-sm">
            <CardHeader className="border-b bg-muted/20 pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-tighter">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Product Architect
                    </CardTitle>
                    <div className="flex gap-1">
                        {['identity', 'platform', 'features', 'logic'].map((p) => (
                            <div
                                key={p}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-colors",
                                    currentPhase === p ? "bg-primary scale-125 shadow-[0_0_8px_rgba(var(--primary),0.5)]" : "bg-muted"
                                )}
                            />
                        ))}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0 relative">
                <ScrollArea className="h-full p-4" ref={scrollRef}>
                    <div className="space-y-4 pb-4">
                        {messages.map((m, idx) => (
                            <div key={idx} className={cn(
                                "flex gap-3 max-w-[85%]",
                                m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                            )}>
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                    m.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted border"
                                )}>
                                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>
                                <div className="space-y-2">
                                    <div className={cn(
                                        "p-3 rounded-2xl text-sm leading-relaxed",
                                        m.role === 'user'
                                            ? "bg-primary text-primary-foreground rounded-tr-none shadow-md"
                                            : "bg-background border border-border rounded-tl-none shadow-sm"
                                    )}>
                                        {m.content}
                                    </div>

                                    {/* AI Suggestion Data Visualization */}
                                    {m.role === 'assistant' && m.suggestedData && (
                                        <div className="p-4 bg-primary/5 rounded-2xl border-2 border-primary/20 shadow-lg animate-in fade-in slide-in-from-top-4 duration-700 backdrop-blur-sm relative overflow-hidden group">
                                            {/* Decorative Background Blob */}
                                            <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />

                                            <div className="relative z-10">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="text-[10px] font-black text-primary uppercase flex items-center gap-1.5 tracking-widest">
                                                        <Sparkles className="w-3.5 h-3.5" /> Proposed Baseline
                                                    </div>
                                                    <Badge variant="default" className="text-[8px] h-4 px-1.5 bg-primary/80 hover:bg-primary border-none">
                                                        PROACTIVE
                                                    </Badge>
                                                </div>

                                                <div className="bg-background/40 p-3 rounded-xl border border-primary/10">
                                                    {m.phase === 'identity' && (
                                                        <div className="space-y-1">
                                                            <div className="text-sm font-bold tracking-tight">{m.suggestedData.projectName}</div>
                                                            <div className="text-xs text-muted-foreground italic">"{m.suggestedData.oneLiner}"</div>
                                                        </div>
                                                    )}

                                                    {m.phase === 'platform' && (
                                                        <div className="flex flex-wrap gap-2">
                                                            <div className="flex items-center gap-1 px-2 py-1 bg-background rounded-md border text-[10px]">
                                                                <Layout className="w-3 h-3 text-primary" /> {m.suggestedData.type}
                                                            </div>
                                                            <div className="flex items-center gap-1 px-2 py-1 bg-background rounded-md border text-[10px]">
                                                                <Box className="w-3 h-3 text-indigo-500" /> {m.suggestedData.techStack?.frontend}
                                                            </div>
                                                            <div className="flex items-center gap-1 px-2 py-1 bg-background rounded-md border text-[10px]">
                                                                <Database className="w-3 h-3 text-amber-500" /> {m.suggestedData.techStack?.backend}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {m.phase === 'features' && (
                                                        <div className="space-y-2">
                                                            <div className="text-[9px] font-bold text-muted-foreground uppercase">Key Features</div>
                                                            <div className="grid grid-cols-2 gap-1.5">
                                                                {m.suggestedData.mustHave?.map((f: string, i: number) => (
                                                                    <div key={i} className="text-[10px] flex items-center gap-2 bg-background/60 px-2 py-1 rounded-lg border border-primary/5">
                                                                        <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse" /> {f}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex gap-2 mt-4">
                                                    <Button size="sm" variant="default" className="h-8 text-[11px] flex-1 font-bold group/btn shadow-md hover:shadow-primary/20" onClick={() => handleSuggestionAction("좋아, 그대로 진행하자.")}>
                                                        좋아요! 승인 <ChevronRight className="w-3 h-3 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="h-8 text-[11px] flex-1 font-medium bg-background/50" onClick={() => handleSuggestionAction("조금 수정하고 싶어.")}>
                                                        수정 요청
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3 mr-auto items-center text-muted-foreground animate-pulse">
                                <Bot className="w-5 h-5" />
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Visual Background Elements */}
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    {currentPhase === 'identity' && <Layout className="w-32 h-32" />}
                    {currentPhase === 'platform' && <Box className="w-32 h-32" />}
                    {currentPhase === 'features' && <Layout className="w-32 h-32" />}
                    {currentPhase === 'logic' && <Database className="w-32 h-32" />}
                </div>
            </CardContent>

            <CardFooter className="p-4 border-t bg-background/80">
                <form
                    className="flex w-full items-center space-x-2"
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                >
                    <Input
                        placeholder={isLoading ? "AI가 생각 중입니다..." : "메시지를 입력하세요 (예: 좋아, SNS 앱 만들래...)"}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                        className="flex-1 bg-muted/20 border-border/50 focus-visible:ring-primary"
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
