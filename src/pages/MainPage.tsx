'use client';

import React, { useEffect, useState } from 'react';
import GlobalSidebar from '@/features/layout/GlobalSidebar';
import ProjectListSidebar from '@/features/layout/ProjectListSidebar';
import ProjectDiagram from '@/features/diagram-editor/ProjectDiagramFeature';
import Auth from '@/features/auth/AuthFeature';
import UserGuide from '@/features/layout/UserGuide';
import SettingsDialog from '@/components/SettingsDialog';
import { useProjectStore } from '@/store/projectStore';

/**
 * 메인 페이지 컴포넌트
 * 
 * 레이아웃 구조:
 * - 좌측: GlobalSidebar (60px 아이콘 네비게이션)
 * - 좌측 확장: ProjectListSidebar (프로젝트 목록, projects 탭일 때만)
 * - 우측: 메인 콘텐츠 영역 (프로젝트 다이어그램 또는 빈 화면)
 */
export default function MainPage() {
    // === 상태 관리 ===
    const { currentProject, loadProjects, projects } = useProjectStore();
    const [activeTab, setActiveTab] = useState<'home' | 'projects' | 'hub'>('home');
    const [settingsOpen, setSettingsOpen] = useState(false);   // 설정 다이얼로그 상태

    // 페이지 로드 시 프로젝트 목록 불러오기
    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            {/* === 좌측 글로벌 사이드바 (아이콘 네비게이션) === */}
            <GlobalSidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onSettingsClick={() => setSettingsOpen(true)}
            />

            {/* === 프로젝트 목록 사이드바 (projects 탭일 때만 표시) === */}
            {activeTab === 'projects' && (
                <ProjectListSidebar />
            )}

            {/* === 메인 콘텐츠 영역 === */}
            <main className="flex-1 relative min-w-0 overflow-hidden">
                {/* 프로젝트가 선택된 경우 다이어그램 표시 */}
                {currentProject ? (
                    <ProjectDiagram />
                ) : (
                    /* 프로젝트 미선택 시 환영 메시지 */
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-primary/5 border border-border/50 rounded-2xl flex items-center justify-center mx-auto">
                                <span className="text-3xl font-bold text-primary/40">N</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-muted-foreground/60">
                                    NoVague
                                </h2>
                                <p className="text-sm text-muted-foreground/40 mt-1">
                                    프로젝트를 선택하거나 새로 만들어보세요
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* === 오버레이 컴포넌트 === */}
            {/* 인증 화면 (미로그인 시 전체 화면 오버레이) */}
            <Auth />
            {/* 사용자 가이드 모달 */}
            <UserGuide />
            {/* AI 설정 다이얼로그 */}
            <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
        </div>
    );
}
