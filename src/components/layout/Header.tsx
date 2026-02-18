'use client';

import React, { useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Save, Settings, Github, Loader2 } from 'lucide-react';
import AISettingsDialog from '@/components/settings/AISettingsDialog';
import GitHubSyncDialog from '@/components/v2/GitHubSyncDialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

export default function Header() {
    const { currentProject, saveProject, isLoading, lastSaved } = useProjectStore();
    const { theme, setTheme } = useTheme();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isGitHubOpen, setIsGitHubOpen] = useState(false);

    const handleSave = async () => {
        if (currentProject) {
            await saveProject();
            toast.success("Project saved successfully");
        }
    };

    return (
        <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 flex items-center justify-between z-50">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 mr-4">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="font-bold text-primary-foreground">V</span>
                    </div>
                    <span className="font-bold text-lg hidden sm:inline-block">NoVague</span>
                </div>

                {currentProject && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground border-l pl-4 hidden md:flex">
                        <span className="font-medium text-foreground">{currentProject.name}</span>
                        {lastSaved && (
                            <span className="text-xs opacity-70">
                                (Last saved: {lastSaved.toLocaleTimeString()})
                            </span>
                        )}
                        <Badge variant="secondary" className="text-[10px] h-5 hidden sm:flex ml-2">
                            {currentProject.techStack.length} Techs
                        </Badge>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                {currentProject && (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSave}
                            disabled={isLoading}
                            className="mr-1 hidden sm:flex"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-3 w-3" />
                                    Save
                                </>
                            )}
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setIsGitHubOpen(true)}
                            title="Sync to GitHub"
                        >
                            <Github className="h-4 w-4" />
                        </Button>
                    </>
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsSettingsOpen(true)}
                    title="AI Settings"
                >
                    <Settings className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    title="Toggle Theme"
                >
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </div>

            <AISettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
            <GitHubSyncDialog open={isGitHubOpen} onOpenChange={setIsGitHubOpen} />
        </header>
    );
}
