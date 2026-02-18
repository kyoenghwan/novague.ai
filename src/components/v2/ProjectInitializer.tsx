'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowUp, Sparkles, Mic, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIConfig } from '@/types';
import { chatWithArchitect } from '@/lib/ai/projectManager';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

interface ProjectInitializerProps {
    onComplete: (idea: string) => void;
    aiConfig?: AIConfig | null;
    userId?: string;
}

export default function ProjectInitializer({ onComplete, aiConfig, userId }: ProjectInitializerProps) {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: '안녕하세요! AI 아키텍트입니다. 만들고 싶은 서비스에 대해 이야기해 주세요. 충분히 논의한 후 "진행시켜"라고 말씀나시면 설계를 시작합니다.'
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: input };
        const currentHistory = [...messages, userMsg];

        setMessages(currentHistory);
        setInput('');
        setIsTyping(true);

        try {
            // Save user message to DB (Async)
            const { saveChatMessage } = require('@/lib/supabase');
            saveChatMessage({ role: 'user', content: userMsg.content, stage: 'Project Initializer' });

            // Call AI Architect
            const response = await chatWithArchitect(
                messages.map(m => ({ role: m.role, content: m.content })),
                userMsg.content,
                aiConfig,
                userId
            );

            const aiMsg: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: response.message
            };
            setMessages(prev => [...prev, aiMsg]);

            // Save AI message to DB (Async)
            saveChatMessage({ role: 'assistant', content: aiMsg.content, stage: 'Project Initializer' });

            if (response.isComplete && response.refinedIdea) {
                // Delay slightly to let user read the confirmation
                setTimeout(() => {
                    onComplete(response.refinedIdea!);
                }, 1500);
            }

        } catch (error) {
            console.error("Chat error:", error);
            const errorMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: "오류가 발생했습니다. 잠시 후 다시 시도해주세요." };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-2xl mx-auto p-4 justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                    <span className="font-bold text-3xl text-white">N</span>
                </div>
                <h1 className="text-3xl font-bold mb-2 tracking-tight">What will we build today?</h1>
                <p className="text-muted-foreground">No ambiguity. Just specs.</p>
            </motion.div>

            <Card className="flex-1 max-h-[500px] flex flex-col shadow-xl border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                    <AnimatePresence>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                                    : 'bg-muted/50 border border-border/50 rounded-tl-none'
                                    }`}>
                                    {msg.content}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {isTyping && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="bg-muted/50 border border-border/50 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1">
                                <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-background/50 border-t border-border/50">
                    <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
                        <Button type="button" variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                            <Paperclip className="h-5 w-5" />
                        </Button>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Describe your app idea..."
                            className="pr-12 py-6 rounded-full border-border/50 focus-visible:ring-offset-0 focus-visible:ring-1 bg-muted/20"
                            autoFocus
                        />
                        <div className="absolute right-2 flex items-center gap-1">
                            {input.trim() ? (
                                <Button type="submit" size="icon" className="h-8 w-8 rounded-full transition-all">
                                    <ArrowUp className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
                                    <Mic className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </Card>

            <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {['🛍️ Online Store', '📊 Admin Dashboard', '💬 Chat App', '📝 Blog Platform'].map((suggestion) => (
                    <button
                        key={suggestion}
                        onClick={() => {
                            setInput(suggestion);
                            // Optional: auto submit
                        }}
                        className="text-xs bg-muted/30 hover:bg-muted/60 border border-border/30 px-3 py-1.5 rounded-full text-muted-foreground transition-colors"
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
        </div>
    );
}
