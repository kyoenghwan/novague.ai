'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProjectStore } from '@/store/projectStore';
import { AIConfig, AIProvider, SUPPORTED_AI_MODELS } from '@/types';
import { Settings, Save, RotateCcw, Key, Bot, Cpu } from 'lucide-react';
import { toast } from 'sonner';

interface AISettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function AISettingsDialog({ open, onOpenChange }: AISettingsDialogProps) {
    const { globalAIConfig, setGlobalAIConfig } = useProjectStore();
    const [config, setConfig] = useState<AIConfig>({
        provider: 'openai',
        model: 'gpt-4-turbo',
        apiKey: '',
        temperature: 0.7,
        maxTokens: 4000
    });

    useEffect(() => {
        if (globalAIConfig) {
            setConfig(globalAIConfig);
        }
    }, [globalAIConfig, open]);

    const handleSave = () => {
        if (!config.apiKey) {
            toast.error("API Key is required");
            return;
        }
        setGlobalAIConfig(config);
        toast.success("AI Settings Saved");
        onOpenChange(false);
    };

    const handleProviderChange = (provider: AIProvider) => {
        const defaultModel = SUPPORTED_AI_MODELS.find(m => m.provider === provider)?.id || '';
        setConfig({ ...config, provider, model: defaultModel });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        AI Configuration
                    </DialogTitle>
                    <DialogDescription>
                        Configure your AI provider and API keys.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Provider Selection */}
                    <div className="grid gap-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Bot className="w-4 h-4" /> Provider
                        </label>
                        <select
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={config.provider}
                            onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
                        >
                            <option value="openai">OpenAI</option>
                            <option value="anthropic">Anthropic</option>
                            <option value="google">Google Gemini</option>
                        </select>
                    </div>

                    {/* Model Selection */}
                    <div className="grid gap-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Cpu className="w-4 h-4" /> Model
                        </label>
                        <select
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={config.model}
                            onChange={(e) => setConfig({ ...config, model: e.target.value })}
                        >
                            {SUPPORTED_AI_MODELS
                                .filter(m => m.provider === config.provider)
                                .map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))
                            }
                        </select>
                    </div>

                    {/* API Key */}
                    <div className="grid gap-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Key className="w-4 h-4" /> API Key
                        </label>
                        <Input
                            type="password"
                            value={config.apiKey}
                            onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                            placeholder={`Enter your ${config.provider} API Key`}
                        />
                        <p className="text-[10px] text-muted-foreground">
                            keys are stored locally in your browser.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Configuration
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
