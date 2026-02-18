'use client';

import React from 'react';
import { ValidationResult, Issue, Suggestion, Optimization } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ShieldAlert,
    Zap,
    Lightbulb,
    ArrowRight,
    SearchCheck,
    Wrench,
    Ban
} from 'lucide-react';
import { motion } from 'framer-motion';

interface IntegrationValidatorProps {
    result: ValidationResult;
    onApprove: () => void;
    onFix: () => void; // Mock fix action
}

export default function IntegrationValidator({ result, onApprove, onFix }: IntegrationValidatorProps) {
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
            case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
            case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
            default: return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-full w-full p-4 gap-4 max-w-6xl mx-auto"
        >
            <div className="flex-none flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <SearchCheck className={`h-6 w-6 ${result.isValid ? 'text-green-600' : 'text-red-500'}`} />
                        Integration Validation Report
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Validating consistency, security, and performance across all design stages.
                    </p>
                </div>
                <div className="flex gap-2">
                    {!result.isValid && (
                        <Button variant="destructive" onClick={onFix} className="gap-2">
                            <Wrench className="h-4 w-4" />
                            Auto-Fix Critical Issues
                        </Button>
                    )}
                    <Button
                        onClick={onApprove}
                        disabled={!result.isValid}
                        className={`${result.isValid ? 'bg-green-600 hover:bg-green-700' : 'opacity-50'} text-white gap-2`}
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Approve & Create Project
                    </Button>
                </div>
            </div>

            {/* Score Validation Banner */}
            <div className={`flex items-center p-6 rounded-xl border shadow-sm ${result.isValid
                    ? 'bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                    : 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
                }`}>
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-2xl font-bold">Overall Score:</span>
                        <span className={`text-4xl font-black ${result.score >= 80 ? 'text-green-600' : result.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {result.score}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${result.isValid ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                            {result.isValid ? 'PASSED' : 'FAILED'}
                        </span>
                    </div>
                    <p className="text-muted-foreground">
                        {result.isValid
                            ? "All critical checks passed. The project is ready for generation."
                            : "Critical issues detected! These must be resolved before proceeding."}
                    </p>
                </div>
                <div className="flex gap-8 text-center px-8 border-l border-border/50">
                    <div>
                        <div className="text-xl font-bold text-red-600">{result.criticalIssues.length}</div>
                        <div className="text-xs uppercase text-muted-foreground font-semibold">Critical</div>
                    </div>
                    <div>
                        <div className="text-xl font-bold text-yellow-600">{result.warnings.length}</div>
                        <div className="text-xs uppercase text-muted-foreground font-semibold">Warnings</div>
                    </div>
                    <div>
                        <div className="text-xl font-bold text-blue-600">{result.suggestions.length}</div>
                        <div className="text-xs uppercase text-muted-foreground font-semibold">Suggestions</div>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
                {/* Check Results - Left Column */}
                <Card className="flex flex-col overflow-hidden shadow-sm border-l-4 border-l-orange-400">
                    <CardHeader className="py-3 px-4 border-b bg-muted/5">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4" /> Issues & Warnings
                        </CardTitle>
                    </CardHeader>
                    <ScrollArea className="flex-1 p-0">
                        {result.criticalIssues.map((issue, idx) => (
                            <IssueItem key={`crit-${idx}`} issue={issue} />
                        ))}
                        {result.warnings.map((issue, idx) => (
                            <IssueItem key={`warn-${idx}`} issue={issue} />
                        ))}
                        {result.criticalIssues.length === 0 && result.warnings.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground">
                                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500 opacity-50" />
                                <p>No issues detected.</p>
                            </div>
                        )}
                    </ScrollArea>
                </Card>

                {/* Suggestions & Optimizations - Right Column */}
                <div className="flex flex-col gap-4 overflow-hidden">
                    <Card className="flex-1 flex flex-col overflow-hidden shadow-sm border-l-4 border-l-blue-400">
                        <CardHeader className="py-3 px-4 border-b bg-muted/5">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Lightbulb className="h-4 w-4" /> Suggestions
                            </CardTitle>
                        </CardHeader>
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-3">
                                {result.suggestions.map((sugg, idx) => (
                                    <div key={idx} className="p-3 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">{sugg.category}</span>
                                            <div className="flex gap-1">
                                                <Badge variant="outline" className="text-[10px] h-4">Impact: {sugg.impact}</Badge>
                                                <Badge variant="outline" className="text-[10px] h-4">Effort: {sugg.effort}</Badge>
                                            </div>
                                        </div>
                                        <h4 className="font-semibold text-sm mb-1">{sugg.title}</h4>
                                        <p className="text-xs text-muted-foreground">{sugg.description}</p>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </Card>

                    <Card className="flex-1 flex flex-col overflow-hidden shadow-sm border-l-4 border-l-green-400">
                        <CardHeader className="py-3 px-4 border-b bg-muted/5">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Zap className="h-4 w-4" /> Optimizations
                            </CardTitle>
                        </CardHeader>
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-3">
                                {result.optimizations.map((opt, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-green-50/30 dark:bg-green-900/10">
                                        <div>
                                            <div className="font-semibold text-sm">{opt.target}</div>
                                            <div className="text-xs text-muted-foreground">{opt.description}</div>
                                        </div>
                                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 pointer-events-none">
                                            +{opt.estimatedGain} gain
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
}

function IssueItem({ issue }: { issue: Issue }) {
    const getSeverityIcon = (severity: string) => {
        if (severity === 'critical') return <Ban className="h-4 w-4" />;
        if (severity === 'high') return <AlertTriangle className="h-4 w-4" />;
        return <AlertTriangle className="h-4 w-4" />;
    };

    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case 'critical': return 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20';
            case 'high': return 'border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20';
            default: return 'border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20';
        }
    };

    return (
        <div className={`p-4 border-b last:border-0 ${getSeverityStyles(issue.severity)}`}>
            <div className="flex items-start gap-3">
                <div className={`mt-0.5 p-1 rounded-full ${issue.severity === 'critical' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                    {getSeverityIcon(issue.severity)}
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{issue.type.replace('_', ' ').toUpperCase()}</span>
                        <Badge variant="outline" className="uppercase text-[10px]">{issue.severity}</Badge>
                    </div>
                    <p className="text-sm font-medium mb-1">{issue.description}</p>
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <SearchCheck className="h-3 w-3" /> Location: {issue.location}
                    </p>

                    <div className="bg-background/80 p-2 rounded text-xs border">
                        <span className="font-semibold text-green-600 dark:text-green-500 mr-2">Solution:</span>
                        {issue.solution}
                    </div>

                    {issue.autoFixAvailable && (
                        <div className="mt-2 text-xs flex items-center text-blue-600 font-medium cursor-pointer hover:underline">
                            <Wrench className="h-3 w-3 mr-1" />
                            Auto-fix available
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
