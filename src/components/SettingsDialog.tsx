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
    const { globalAIConfig, setGlobalAIConfig, hasHydrated } = useProjectStore();
    const [config, setConfig] = useState<AIConfig>({
        provider: 'openai',
        model: 'gpt-4o',
        apiKey: '',
        maxTokens: 4000
    });
    const [showKey, setShowKey] = useState(false);

    // Hydration 완료 후 저장된 설정을 로컬 상태에 반영
    useEffect(() => {
        if (hasHydrated && globalAIConfig) {
            setConfig(globalAIConfig);
        }
    }, [globalAIConfig, hasHydrated, open]);

    const handleSave = () => {
        setGlobalAIConfig(config);
        onOpenChange(false);
    };

    const handleProviderChange = (value: AIProvider) => {
        const defaultModel = SUPPORTED_AI_MODELS[value][0] || '';
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
                                {SUPPORTED_AI_MODELS[config.provider]
                                    .map(modelId => (
                                        <SelectItem key={modelId} value={modelId}>
                                            {modelId}
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
                                type={showKey ? "text" : "password"}
                                value={config.apiKey}
                                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                                placeholder={`sk-...`}
                                className="pr-10"
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowKey(!showKey)}
                            >
                                {showKey ? <Lock className="w-4 h-4 text-primary" /> : <Settings className="w-4 h-4 text-muted-foreground" />}
                            </Button>
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
