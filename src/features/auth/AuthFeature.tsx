'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Profile, ensureProfile, getProfile } from '@/services/profile';
import { Session } from '@supabase/supabase-js';
import { LogOut, User, ShieldCheck, CreditCard } from 'lucide-react';
import { cn } from '@/services/common-utils';

export default function Auth() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const checkUser = async (session: Session | null) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                const refreshedProfile = await ensureProfile(currentUser);
                setProfile(refreshedProfile);
            } else {
                setProfile(null);
            }
            setLoading(false);
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
            checkUser(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
            await checkUser(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) toast.error(error.message);
        setLoading(false);
    };

    if (loading || user) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
                <CardHeader><CardTitle className="text-2xl font-black tracking-tighter uppercase">NoVague AI</CardTitle><CardDescription>Login to manage your projects.</CardDescription></CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4"><Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required /><Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required /></CardContent>
                    <CardFooter><Button type="submit" className="w-full font-bold uppercase tracking-widest" disabled={loading}>Login</Button></CardFooter>
                </form>
            </Card>
        </div>
    );
}
