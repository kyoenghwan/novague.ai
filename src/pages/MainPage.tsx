'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/features/layout/Header';
import Sidebar from '@/features/layout/Sidebar';
import ProjectDiagram from '@/features/diagram-editor/ProjectDiagramFeature';
import RightPanel from '@/features/layout/RightPanel';
import Auth from '@/features/auth/AuthFeature';
import UserGuide from '@/features/layout/UserGuide';
import OnboardingChat from '@/features/onboarding/OnboardingChat';
import { useProjectStore } from '@/store/projectStore';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function MainPage() {
    const { currentProject, createProject, loadProjects, projects } = useProjectStore();
    const [isOnboarding, setIsOnboarding] = useState(false);

    useEffect(() => { loadProjects(); }, [loadProjects]);

    useEffect(() => {
        if (!currentProject && projects.length === 0) {
            createProject("My Project", "Initial project.", ["Next.js", "Tailwind"]);
            setIsOnboarding(true);
        }
    }, [currentProject, projects.length, createProject]);

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 relative border-r border-border min-w-0">
                    <ProjectDiagram />

                    {/* Stage 1: Onboarding Chat Overlay */}
                    {isOnboarding && (
                        <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-md flex items-center justify-center p-4">
                            <div className="w-full max-w-4xl relative">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute -top-12 right-0 text-white hover:bg-white/20"
                                    onClick={() => setIsOnboarding(false)}
                                >
                                    건너뛰기 (Skip)
                                </Button>
                                <OnboardingChat />
                            </div>
                        </div>
                    )}

                    {/* AI Architect Trigger (Floating Button) */}
                    {!isOnboarding && (
                        <Button
                            className="absolute bottom-6 right-6 shadow-2xl gap-2 rounded-full h-12 px-6 animate-bounce"
                            onClick={() => setIsOnboarding(true)}
                        >
                            <Sparkles className="w-4 h-4" />
                            AI Architect 시작
                        </Button>
                    )}
                </main>
                <RightPanel />
            </div>
            <Auth />
            <UserGuide />
        </div>
    );
}
