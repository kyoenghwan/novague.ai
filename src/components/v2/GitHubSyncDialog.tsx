import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProjectStore } from '@/store/projectStore';
import { syncProjectSpec } from '@/lib/github/sync';
import { toast } from 'sonner';
import { Github, Loader2 } from 'lucide-react';
import { GitHubConfig } from '@/types';

interface GitHubSyncDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function GitHubSyncDialog({ open, onOpenChange }: GitHubSyncDialogProps) {
    const { currentProject, saveProject, updateProject } = useProjectStore();
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState<GitHubConfig>({
        owner: '',
        repo: '',
        branch: 'main',
        token: ''
    });

    // Load existing config if available
    useEffect(() => {
        if (currentProject?.githubConfig) {
            setConfig({
                ...currentProject.githubConfig,
                token: currentProject.githubConfig.token || '' // Token might not be persisted if we chose so, but here we assume it is for current session
            });
        }
    }, [currentProject, open]);

    const handleSync = async () => {
        if (!currentProject) return;
        if (!config.owner || !config.repo || !config.token) {
            toast.error("Please fill in all GitHub fields.");
            return;
        }

        setLoading(true);
        try {
            // 1. Update Project Config first
            const updatedProject = {
                ...currentProject,
                githubConfig: config
            };
            // We might need a specific action to update project metadata without full save loop, 
            // but saveProject() usually saves currentProject state.
            // Let's manually update the store's currentProject first if needed, 
            // strictly creating a temp object for sync function is safer if we don't want to persist token permanently in DB yet.

            // For this feature, let's persist it to the store so user doesn't re-enter.
            // Note: Security wise, persisting token in plain text in localStorage/Supabase is risky. 
            // User should be aware. For MVP, we proceed.

            await syncProjectSpec(updatedProject);

            // Persist the config
            updateProject({ githubConfig: config });
            await saveProject();

            toast.success("Successfully synced to GitHub!");
            onOpenChange(false);
        } catch (error: any) {
            toast.error(`Sync Failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Github className="w-5 h-5" />
                        GitHub Spec Sync
                    </DialogTitle>
                    <DialogDescription>
                        Sync your project specification and README to a GitHub repository.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="owner" className="text-right">
                            Owner
                        </Label>
                        <Input
                            id="owner"
                            placeholder="e.g. facebook"
                            className="col-span-3"
                            value={config.owner}
                            onChange={(e) => setConfig({ ...config, owner: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="repo" className="text-right">
                            Repo
                        </Label>
                        <Input
                            id="repo"
                            placeholder="e.g. react"
                            className="col-span-3"
                            value={config.repo}
                            onChange={(e) => setConfig({ ...config, repo: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="branch" className="text-right">
                            Branch
                        </Label>
                        <Input
                            id="branch"
                            placeholder="main"
                            className="col-span-3"
                            value={config.branch}
                            onChange={(e) => setConfig({ ...config, branch: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="token" className="text-right">
                            Token
                        </Label>
                        <Input
                            id="token"
                            type="password"
                            placeholder="ghp_..."
                            className="col-span-3"
                            value={config.token}
                            onChange={(e) => setConfig({ ...config, token: e.target.value })}
                        />
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                        Requires 'repo' scope (for private) or 'public_repo' scope.
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSync} disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Syncing...
                            </>
                        ) : (
                            'Sync Now'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
