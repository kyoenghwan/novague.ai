import React, { useEffect, useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { Button } from '@/components/ui/button';
import { Plus, Folder, LayoutGrid } from 'lucide-react';
import { cn } from '@/services/common-utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/services/supabase-client';
import { Profile, ensureProfile } from '@/services/profile';

/**
 * 프로젝트 목록 사이드바 컴포넌트
 * 
 * 기능:
 * - 사용자의 프로젝트 목록을 표시
 * - 새 프로젝트 생성 버튼
 * - 프로젝트 선택/전환
 * - 하단에 실제 로그인한 사용자 정보 표시
 */
export default function ProjectListSidebar() {
    // === 프로젝트 스토어에서 상태 가져오기 ===
    const { projects, currentProject, setCurrentProject, createProject } = useProjectStore();

    // === 사용자 정보 상태 ===
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<Profile | null>(null);

    /**
     * 로그인한 사용자 정보를 가져옵니다.
     */
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                const p = await ensureProfile(currentUser);
                setProfile(p);
            }
        };
        fetchUser();

        // 인증 상태 변경 구독
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                const p = await ensureProfile(currentUser);
                setProfile(p);
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    /**
     * 새 프로젝트를 생성합니다.
     * 프로젝트 번호는 현재 목록 개수 + 1로 자동 지정됩니다.
     */
    const handleCreateProject = async () => {
        const name = `Project ${projects.length + 1}`;
        await createProject(name, "New AI Project", ["Next.js"]);
    };

    return (
        <aside className="w-[260px] flex-none border-r bg-sidebar flex flex-col h-full transition-colors duration-300">
            {/* 헤더 영역 - NoVague 로고 */}
            <div className="p-4 h-14 flex items-center border-b px-6 bg-sidebar-accent/10">
                <LayoutGrid className="w-5 h-5 mr-3 text-primary" />
                <span className="font-bold text-sm tracking-tight text-sidebar-foreground">NoVague</span>
            </div>

            {/* 새 프로젝트 생성 버튼 */}
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

            {/* 프로젝트 목록 */}
            <div className="px-4 pb-2">
                <p className="text-xs font-medium text-muted-foreground mb-2 px-2">YOUR PROJECTS</p>
                <ScrollArea className="h-[calc(100vh-240px)]">
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

            {/* 하단 사용자 정보 영역 */}
            <div className="mt-auto p-4 border-t">
                <div className="flex items-center gap-3 px-2">
                    {/* 사용자 아바타 */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex flex-col min-w-0">
                        {/* 사용자 이름 또는 이메일 */}
                        <span className="text-sm font-medium truncate">
                            {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                        </span>
                        {/* 구독 등급 표시 */}
                        <span className={cn(
                            "text-xs",
                            profile?.subscription_tier === 'pro' ? "text-amber-500 font-semibold" : "text-muted-foreground"
                        )}>
                            {profile?.subscription_tier === 'pro' ? 'Pro Plan' :
                                profile?.subscription_tier === 'enterprise' ? 'Enterprise' : 'Free Plan'}
                        </span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
