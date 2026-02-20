import React from 'react';
import { Home, Folder, Globe, Settings, Plus } from 'lucide-react';
import { cn } from '@/services/common-utils';

// Update GlobalSidebar to accept onSettingsClick
interface GlobalSidebarProps {
    activeTab: 'home' | 'projects' | 'hub';
    onTabChange: (tab: 'home' | 'projects' | 'hub') => void;
    onProfileClick?: () => void;
    onSettingsClick?: () => void;
}

export default function GlobalSidebar({ activeTab, onTabChange, onProfileClick, onSettingsClick }: GlobalSidebarProps) {
    return (
        <aside className="w-[60px] flex-none border-r bg-background flex flex-col items-center py-4 gap-4 z-50">
            {/* ... Logo & NavItems ... */}
            {/* This part remains mostly same, just updating Bottom Items */}

            {/* Logo / New */}
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-2 text-primary cursor-pointer hover:bg-primary/20 transition-colors">
                <span className="font-bold text-lg">N</span>
            </div>

            {/* Nav Items */}
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

            {/* Bottom Items */}
            <div className="mt-auto flex flex-col gap-2 w-full px-2">
                <NavItem icon={Settings} label="Settings" onClick={onSettingsClick || (() => { })} />
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
