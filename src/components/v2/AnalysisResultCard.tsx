'use client';

import React from 'react';
import { ProjectAnalysis } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, Layers, Code2, Database, Globe, BrainCircuit, Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalysisResultCardProps {
    analysis: ProjectAnalysis;
    onApprove: () => void;
    onRetry: () => void;
}

export default function AnalysisResultCard({ analysis, onApprove, onRetry }: AnalysisResultCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col h-full max-w-4xl mx-auto p-4 justify-center"
        >
            <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-500 px-4 py-1.5 rounded-full text-sm font-medium mb-4 border border-green-500/20">
                    <BrainCircuit className="h-4 w-4" />
                    AI Analysis Complete
                </div>
                <h2 className="text-2xl font-bold">{analysis.projectName}</h2>
                <p className="text-muted-foreground mt-1 max-w-lg mx-auto">{analysis.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Tech Stack Column */}
                <Card className="md:col-span-1 border-primary/20 bg-primary/5 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Layers className="h-5 w-5 text-primary" />
                            Tech Stack
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Frontend</div>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="bg-background">{analysis.techStack.frontend.framework}</Badge>
                                <Badge variant="outline">{analysis.techStack.frontend.styling}</Badge>
                            </div>
                        </div>
                        <Separator className="bg-primary/20" />
                        <div>
                            <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Backend</div>
                            <div className="space-y-1">
                                <div className="text-sm font-medium">{analysis.techStack.backend.platform}</div>
                                <div className="text-xs text-muted-foreground">{analysis.techStack.backend.database}</div>
                            </div>
                        </div>
                        <Separator className="bg-primary/20" />
                        <div>
                            <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Infrastructure</div>
                            <div className="text-xs text-muted-foreground">
                                {analysis.techStack.deployment.frontend} + {analysis.techStack.deployment.backend}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Features & Reasoning Column */}
                <Card className="md:col-span-2 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BrainCircuit className="h-5 w-5 text-purple-500" />
                            Core Architecture
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-sm mb-3">Core Features</h4>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {analysis.coreFeatures.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-muted/20 p-4 rounded-lg border border-border/50">
                            <h4 className="font-semibold text-xs uppercase mb-2 text-purple-500 flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                AI Reasoning
                            </h4>
                            <p className="text-sm text-muted-foreground italic leading-relaxed">
                                "{analysis.reasoning.techStackReason}"
                            </p>
                        </div>

                        <div className="flex gap-4 text-xs text-muted-foreground border-t pt-4">
                            <div>⏱️ Est. Time: <span className="font-medium text-foreground">{analysis.developmentTime}</span></div>
                            <div>👥 Team: <span className="font-medium text-foreground">{analysis.teamSize}</span></div>
                            <div>🧩 Complexity: <span className="font-medium text-foreground capitalize">{analysis.estimatedComplexity}</span></div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t border-border bg-muted/10 p-4">
                        <Button variant="ghost" onClick={onRetry}>
                            Retry / Modify
                        </Button>
                        <Button onClick={onApprove} size="lg" className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-lg shadow-green-600/20">
                            <Play className="h-4 w-4" />
                            Start Building
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </motion.div>
    );
}

// Icon helper
function Sparkles({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m12 3-1.9 5.8a2 2 0 0 1-1.29 1.29L3 12l5.8 1.9a2 2 0 0 1 1.29 1.29L12 21l1.9-5.8a2 2 0 0 1 1.29-1.29L21 12l-5.8-1.9a2 2 0 0 1-1.29-1.29z" />
        </svg>
    )
}
