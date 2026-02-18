'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function Auth() {
    const [user, setUser] = useState<any>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<'sign-in' | 'sign-up'>('sign-in');

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (view === 'sign-up') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert('회원가입 성공! 이메일을 확인해주세요.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'github') => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (err: any) {
            let message = err.message;
            if (message === 'Unsupported provider: provider is not enabled' || message.includes('provider is not enabled')) {
                message = 'Supabase 대시보드에서 해당 소셜 로그인(Google/GitHub) 설정이 필요합니다.';
            }
            setError(message);
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    if (user) {
        return (
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                    {user.email}
                </Badge>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="h-6 text-xs">
                    Logout
                </Button>
            </div>
        );
    }

    return (
        <Card className="z-50 shadow-2xl relative w-full mb-4">
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg">{view === 'sign-in' ? '로그인' : '회원가입'}</CardTitle>
                <CardDescription className="text-xs">
                    {view === 'sign-in' ? '프로젝트 저장을 위해 로그인' : '새 계정 생성'}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <form onSubmit={handleAuth} className="space-y-3">
                    <Input
                        type="email"
                        placeholder="Email"
                        className="h-8 text-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        type="password"
                        placeholder="Password"
                        className="h-8 text-sm"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <p className="text-xs text-red-500">{error}</p>}
                    <div className="flex flex-col gap-2">
                        <Button type="submit" disabled={loading} size="sm">
                            {loading ? '처리 중...' : (view === 'sign-in' ? '로그인' : '회원가입')}
                        </Button>

                        <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" type="button" disabled={loading} size="sm" onClick={() => handleSocialLogin('google')}>
                                Google
                            </Button>
                            <Button variant="outline" type="button" disabled={loading} size="sm" onClick={() => handleSocialLogin('github')}>
                                GitHub
                            </Button>
                        </div>

                        <Button
                            type="button"
                            variant="link"
                            className="text-xs p-0 h-auto mt-2"
                            onClick={() => setView(view === 'sign-in' ? 'sign-up' : 'sign-in')}
                        >
                            {view === 'sign-in' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
