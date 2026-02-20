'use client';

import React from 'react';
import { useProjectStore } from '@/store/projectStore';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Save, Github, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { supabase } from '@/services/supabase-client';
import { Profile, ensureProfile } from '@/services/profile';
import { LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';
import { cn } from '@/services/common-utils';
import { useEffect, useState } from 'react';

export default function Header() {
    const { currentProject, saveProject, isLoading, lastSaved } = useProjectStore();
    const { theme, setTheme } = useTheme();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                const p = await ensureProfile(currentUser);
                setProfile(p);
            }
        };

        checkUser();

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

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) toast.error(error.message);
        else toast.success("Logged out successfully");
    };

    return (
        <header className="h-14 border-b border-border bg-background/95 backdrop-blur flex items-center justify-between px-4 z-50">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold italic">V</div>
                    <span className="font-bold text-lg tracking-tight">NoVague AI</span>
                </div>
                {currentProject && <span className="bg-muted px-3 py-1 rounded-full text-xs font-medium">{currentProject.name}</span>}
            </div>
            <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground mr-2">{lastSaved ? `Saved: ${new Date(lastSaved).toLocaleTimeString()}` : ''}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { saveProject(); toast.success("Saved!"); }} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" className="h-8 hidden sm:flex gap-2">
                    <Github className="w-4 h-4" /> Sync
                </Button>

                {user && (
                    <div className="flex items-center gap-3 ml-2 border-l pl-4">
                        <div className="flex flex-col items-end mr-1">
                            <span className="text-[10px] font-bold text-foreground leading-tight max-w-[100px] truncate">
                                {user.email}
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className={cn(
                                    "text-[8px] font-black px-1.5 rounded-sm uppercase tracking-tighter",
                                    profile?.subscription_tier === 'pro' ? "bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.4)]" : "bg-primary/10 text-primary"
                                )}>
                                    {profile?.subscription_tier || 'FREE'}
                                </span>
                            </div>
                        </div>
                        <div className="relative group/avatar">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-indigo-500/10 cursor-pointer overflow-hidden ring-2 ring-background ring-offset-1 ring-offset-border/20 transition-all hover:scale-105 active:scale-95">
                                {user.email?.[0].toUpperCase() || <UserIcon className="w-4 h-4" />}
                            </div>

                            <button
                                onClick={handleLogout}
                                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity shadow-lg hover:scale-110 active:scale-90"
                                title="Logout"
                            >
                                <LogOut className="w-2 h-2" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
