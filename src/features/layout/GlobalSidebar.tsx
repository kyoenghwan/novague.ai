import React from 'react';
import { Home, Folder, Globe, Settings, LogOut } from 'lucide-react';
import { cn } from '@/services/common-utils';
import { supabase } from '@/services/supabase-client';
import { toast } from 'sonner';

/**
 * 글로벌 사이드바 컴포넌트
 * 
 * 화면 좌측에 고정되는 60px 폭의 아이콘 기반 네비게이션 바입니다.
 * 
 * 구성:
 * - 상단: NoVague 로고
 * - 중간: Home, Projects, Hub 네비게이션
 * - 하단: Settings, 프로필 아바타, 로그아웃
 */
interface GlobalSidebarProps {
    activeTab: 'home' | 'projects' | 'hub';         // 현재 활성 탭
    onTabChange: (tab: 'home' | 'projects' | 'hub') => void;  // 탭 변경 핸들러
    onProfileClick?: () => void;                     // 프로필 클릭 핸들러
    onSettingsClick?: () => void;                    // 설정 클릭 핸들러
}

export default function GlobalSidebar({ activeTab, onTabChange, onProfileClick, onSettingsClick }: GlobalSidebarProps) {
    /**
     * 로그아웃 처리
     */
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) toast.error(error.message);
        else toast.success("로그아웃되었습니다.");
    };

    return (
        <aside className="w-[60px] flex-none border-r bg-background flex flex-col items-center py-4 gap-4 z-50">
            {/* NoVague 로고 */}
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-2 text-primary cursor-pointer hover:bg-primary/20 transition-colors">
                <span className="font-bold text-lg">N</span>
            </div>

            {/* 메인 네비게이션 아이템 */}
            <nav className="flex flex-col gap-4 w-full px-2">
                <NavItem
                    icon={Home}
                    label="Home"
                    active={activeTab === 'home'}
                    onClick={() => onTabChange('home')}
                />
                <NavItem
                    icon={Folder}
                    label="Projects"
                    active={activeTab === 'projects'}
                    onClick={() => onTabChange('projects')}
                />
                <NavItem
                    icon={Globe}
                    label="Hub"
                    active={activeTab === 'hub'}
                    onClick={() => onTabChange('hub')}
                />
            </nav>

            {/* 하단 아이템: 설정, 프로필, 로그아웃 */}
            <div className="mt-auto flex flex-col gap-2 w-full px-2">
                {/* 설정 버튼 */}
                <NavItem icon={Settings} label="Settings" onClick={onSettingsClick || (() => { })} />
                {/* 로그아웃 버튼 */}
                <NavItem icon={LogOut} label="Logout" onClick={handleLogout} />
                {/* 사용자 아바타 */}
                <div
                    onClick={onProfileClick}
                    className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 mx-auto flex items-center justify-center text-white text-xs font-bold mt-2 cursor-pointer hover:scale-105 transition-transform"
                >
                    U
                </div>
            </div>
        </aside>
    );
}

/**
 * 네비게이션 아이템 컴포넌트
 * 아이콘과 라벨을 세로로 배치하는 버튼 형태의 컴포넌트입니다.
 */
function NavItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-10 h-10 rounded-xl flex flex-col items-center justify-center transition-all group relative gap-0.5",
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
            title={label}
        >
            <Icon className={cn("w-5 h-5", active && "fill-current")} />
            <span className="text-[10px] font-medium scale-75 origin-center">{label}</span>
        </button>
    );
}
