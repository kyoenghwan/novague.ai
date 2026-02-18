import React from 'react';
import { useProjectStore } from '@/store/projectStore';
import { Button } from '@/components/ui/button';
import { Plus, Folder, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export default function ProjectListSidebar() {
    const { projects, currentProject, setCurrentProject, createProject } = useProjectStore();

    const handleCreateProject = async () => {
        const name = `Project ${projects.length + 1}`;
        await createProject(name, "New AI Project", ["Next.js"]);
    };

    return (
        <aside className="w-[260px] flex-none border-r bg-sidebar flex flex-col h-full transition-colors duration-300">
            <div className="p-4 h-14 flex items-center border-b px-6 bg-sidebar-accent/10">
                <LayoutGrid className="w-5 h-5 mr-3 text-primary" />
                <span className="font-bold text-sm tracking-tight text-sidebar-foreground">NoVague</span>

            </div>

            <div className="p-3">
                <Button
                    onClick={handleCreateProject}
                    className="w-full justify-start gap-2 bg-primary/10 text-primary hover:bg-primary/20 shadow-none border-0"
                    variant="outline"
                >
                    <Plus className="w-4 h-4" />
                    New Project
                </Button>
            </div>

            <div className="px-4 pb-2">
                <p className="text-xs font-medium text-muted-foreground mb-2 px-2">YOUR PROJECTS</p>
                <ScrollArea className="h-[calc(100vh-140px)]">
                    <div className="space-y-1">
                        {projects.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setCurrentProject(p)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all group",
                                    currentProject?.id === p.id
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Folder className={cn(
                                    "w-4 h-4 transition-colors",
                                    currentProject?.id === p.id ? "text-primary-foreground/90" : "text-muted-foreground group-hover:text-foreground"
                                )} />
                                <span className="truncate">{p.name}</span>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            <div className="mt-auto p-4 border-t">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        U
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">User</span>
                        <span className="text-xs text-muted-foreground">Pro Plan</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
