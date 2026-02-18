import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjectStore } from '@/store/projectStore';
import { AIConfig, SUPPORTED_AI_MODELS, AIProvider } from '@/types';
import { Settings, Lock } from 'lucide-react';

interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
    const { globalAIConfig, setGlobalAIConfig } = useProjectStore();
    const [config, setConfig] = useState<AIConfig>({
        provider: 'openai',
        model: 'gpt-4o',
        apiKey: '',
        maxTokens: 4000
    });

    useEffect(() => {
        if (globalAIConfig) {
            setConfig(globalAIConfig);
        }
    }, [globalAIConfig, open]);

    const handleSave = () => {
        setGlobalAIConfig(config);
        onOpenChange(false);
    };

    const handleProviderChange = (value: AIProvider) => {
        const defaultModel = SUPPORTED_AI_MODELS.find(m => m.provider === value)?.id || '';
        setConfig({
            ...config,
            provider: value,
            model: defaultModel
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        AI Settings
                    </DialogTitle>
                    <DialogDescription>
                        Configure the AI provider for the Architect. Keys are stored locally in your browser.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="provider" className="text-right">
                            Provider
                        </Label>
                        <Select
                            value={config.provider}
                            onValueChange={(val: string) => handleProviderChange(val as AIProvider)}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="openai">OpenAI</SelectItem>
                                <SelectItem value="anthropic">Anthropic</SelectItem>
                                <SelectItem value="google">Google Gemini</SelectItem>
                                {/* <SelectItem value="mistral">Mistral AI</SelectItem> */}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="model" className="text-right">
                            Model
                        </Label>
                        <Select
                            value={config.model}
                            onValueChange={(val: string) => setConfig({ ...config, model: val })}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                                {SUPPORTED_AI_MODELS
                                    .filter(m => m.provider === config.provider)
                                    .map(m => (
                                        <SelectItem key={m.id} value={m.id}>
                                            {m.name}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="apiKey" className="text-right">
                            API Key
                        </Label>
                        <div className="col-span-3 relative">
                            <Input
                                id="apiKey"
                                type="password"
                                value={config.apiKey}
                                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                                placeholder={`sk-...`}
                                className="pr-10"
                            />
                            <Lock className="w-4 h-4 text-muted-foreground absolute right-3 top-3" />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="submit" onClick={handleSave}>Save Configuration</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
