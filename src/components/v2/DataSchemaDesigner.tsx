'use client';

import React, { useState } from 'react';
import { DataArchitecture } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Server, Key, Lock, Fingerprint, FileJson, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface DataSchemaDesignerProps {
    architecture: DataArchitecture;
    onApprove: () => void;
    onModify: () => void;
}

export default function DataSchemaDesigner({ architecture, onApprove, onModify }: DataSchemaDesignerProps) {
    const [selectedTab, setSelectedTab] = useState<'erd' | 'api'>('erd');

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-full w-full p-4 gap-4"
        >
            <div className="flex-none flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Database className="h-5 w-5 text-blue-500" />
                        Data Architecture & API Design
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {architecture.database.tables.length} tables and {architecture.apis.length} API endpoints generated.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onModify}>Modify Schema</Button>
                    <Button onClick={onApprove} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Approve Architecture
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden border rounded-xl bg-slate-50/50 dark:bg-slate-900/50 shadow-sm flex flex-col">
                <div className="border-b px-4 py-2 bg-background/50 backdrop-blur-sm">
                    <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)} className="w-full">
                        <TabsList>
                            <TabsTrigger value="erd" className="flex items-center gap-2">
                                <Database className="h-4 w-4" /> Database Schema (ERD)
                            </TabsTrigger>
                            <TabsTrigger value="api" className="flex items-center gap-2">
                                <Server className="h-4 w-4" /> API Endpoints
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="flex-1 overflow-hidden p-4 relative">
                    {selectedTab === 'erd' && (
                        <div className="h-full overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                            {architecture.database.tables.map((table) => (
                                <Card key={table.name} className="flex flex-col h-fit border-blue-100 dark:border-blue-900/30 shadow-sm">
                                    <div className="bg-blue-50 dark:bg-blue-950/20 px-4 py-3 border-b border-blue-100 dark:border-blue-900/30">
                                        <div className="font-bold flex items-center justify-between">
                                            <span className="text-blue-700 dark:text-blue-400">{table.name}</span>
                                            <Badge variant="outline" className="text-[10px] bg-background">Table</Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">{table.description}</div>
                                    </div>
                                    <div className="p-0">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-muted-foreground bg-muted/30">
                                                <tr>
                                                    <th className="px-4 py-2 font-medium">Field</th>
                                                    <th className="px-4 py-2 font-medium">Type</th>
                                                    <th className="px-4 py-2 font-medium">Attr</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {table.fields.map((field) => (
                                                    <tr key={field.name} className="border-b last:border-0 border-border/40 hover:bg-muted/10">
                                                        <td className="px-4 py-2 font-medium flex items-center gap-1">
                                                            {field.constraints.includes('PK') && <Key className="h-3 w-3 text-yellow-500" />}
                                                            {field.name}
                                                        </td>
                                                        <td className="px-4 py-2 text-muted-foreground font-mono text-xs">{field.type}</td>
                                                        <td className="px-4 py-2">
                                                            <div className="flex gap-1 flex-wrap">
                                                                {field.constraints.map(c => (
                                                                    <span key={c} className="text-[10px] px-1 rounded bg-muted text-muted-foreground border">{c}</span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            ))}

                            {/* Security Policies Card */}
                            <Card className="flex flex-col h-fit border-orange-100 dark:border-orange-900/30 shadow-sm">
                                <div className="bg-orange-50 dark:bg-orange-950/20 px-4 py-3 border-b border-orange-100 dark:border-orange-900/30">
                                    <div className="font-bold flex items-center gap-2 text-orange-700 dark:text-orange-400">
                                        <Lock className="h-4 w-4" /> Security Policies (RLS)
                                    </div>
                                </div>
                                <div className="p-4 space-y-2">
                                    {architecture.database.policies.map((policy, idx) => (
                                        <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                            <ShieldCheck className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                            {policy}
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}

                    {selectedTab === 'api' && (
                        <div className="h-full overflow-y-auto space-y-2 pb-20">
                            {architecture.apis.map((api, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-3 bg-card border rounded-lg hover:shadow-md transition-shadow group">
                                    <div className={`px-3 py-1 rounded text-xs font-bold w-16 text-center shrink-0 ${api.method === 'GET' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                        api.method === 'POST' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            api.method === 'DELETE' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                        }`}>
                                        {api.method}
                                    </div>
                                    <div className="font-mono text-sm font-medium flex-1">
                                        {api.path}
                                    </div>
                                    <div className="text-sm text-muted-foreground hidden sm:block">
                                        {api.description}
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        {api.authentication && (
                                            <Badge variant="outline" className="gap-1 text-[10px]">
                                                <Fingerprint className="h-3 w-3" /> Auth
                                            </Badge>
                                        )}
                                        <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function ShieldCheck({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
