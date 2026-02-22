'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';
import { Profile, ensureProfile } from '@/services/profile';
import { Session } from '@supabase/supabase-js';

/**
 * 인증 컴포넌트 - 로그인/회원가입 화면
 * 
 * 기능:
 * - 이메일/비밀번호 로그인
 * - Google OAuth 소셜 로그인
 * - Apple OAuth 소셜 로그인
 * - 회원가입 모드 전환
 * - 로그인 상태 확인 후 자동 숨김
 */
export default function Auth() {
    // === 상태 관리 ===
    const [user, setUser] = useState<any>(null);            // 현재 로그인한 사용자
    const [profile, setProfile] = useState<Profile | null>(null);  // 사용자 프로필
    const [loading, setLoading] = useState(true);            // 로딩 상태
    const [email, setEmail] = useState('');                  // 이메일 입력값
    const [password, setPassword] = useState('');            // 비밀번호 입력값
    const [isSignUp, setIsSignUp] = useState(false);         // 회원가입 모드 여부
    const [socialLoading, setSocialLoading] = useState<string | null>(null); // 소셜 로그인 로딩 상태

    /**
     * 세션 변경 시 사용자 정보 및 프로필을 갱신합니다.
     */
    useEffect(() => {
        const checkUser = async (session: Session | null) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                // 프로필이 없으면 자동 생성
                const refreshedProfile = await ensureProfile(currentUser);
                setProfile(refreshedProfile);
            } else {
                setProfile(null);
            }
            setLoading(false);
        };

        // 초기 세션 확인
        supabase.auth.getSession().then(({ data: { session } }) => {
            checkUser(session);
        });

        // 인증 상태 변경 구독
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
            await checkUser(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    /**
     * 이메일/비밀번호 로그인 처리
     */
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) toast.error(error.message);
        setLoading(false);
    };

    /**
     * 이메일/비밀번호 회원가입 처리
     */
    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
            toast.error(error.message);
        } else {
            toast.success('회원가입 완료! 이메일을 확인해주세요.');
            setIsSignUp(false); // 로그인 모드로 전환
        }
        setLoading(false);
    };

    /**
     * OAuth 소셜 로그인 처리 (Google, Apple)
     * Supabase OAuth를 통해 외부 프로바이더로 리다이렉트합니다.
     */
    const handleOAuthLogin = async (provider: 'google' | 'apple') => {
        setSocialLoading(provider);
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                // 로그인 완료 후 현재 페이지로 리다이렉트
                redirectTo: window.location.origin,
            }
        });
        if (error) {
            toast.error(error.message);
        }
        setSocialLoading(null);
    };

    // 로딩 중이거나 이미 로그인된 상태면 아무것도 렌더링하지 않음
    if (loading || user) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-background flex">
            {/* === 왼쪽 영역: 빈 공간 (다크모드에서 배경 효과) === */}
            <div className="hidden lg:flex flex-1 items-center justify-center bg-background" />

            {/* === 오른쪽 영역: 로그인 폼 === */}
            <div className="flex-1 flex flex-col items-center justify-center px-4">
                {/* 로고 및 환영 메시지 */}
                <div className="text-center mb-8">
                    {/* NoVague 로고 아이콘 */}
                    <div className="w-16 h-16 bg-primary/10 border border-border rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-2xl font-bold text-primary">N</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">
                        Welcome to NoVague
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Sign in to start designing your next big idea with clear specs.
                    </p>
                </div>

                {/* 로그인/회원가입 카드 */}
                <Card className="w-full max-w-sm border-border/50 shadow-xl bg-card/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-4">
                        <h2 className="text-xl font-bold text-primary">
                            {isSignUp ? '회원가입' : '로그인'}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            {isSignUp ? '새 계정을 만들어 시작하세요' : '프로젝트 저장을 위해 로그인'}
                        </p>
                    </CardHeader>

                    {/* 이메일/비밀번호 폼 */}
                    <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
                        <CardContent className="space-y-3 pb-4">
                            <Input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className="h-11 bg-muted/30 border-border/50"
                            />
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                className="h-11 bg-muted/30 border-border/50"
                            />
                            <Button
                                type="submit"
                                className="w-full h-11 font-semibold"
                                disabled={loading}
                            >
                                {isSignUp ? '회원가입' : '로그인'}
                            </Button>
                        </CardContent>
                    </form>

                    {/* OR CONTINUE WITH 구분선 */}
                    <div className="px-6 pb-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border/50" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-3 text-muted-foreground tracking-wider">
                                    OR CONTINUE WITH
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 소셜 로그인 버튼 */}
                    <CardContent className="pb-4 pt-0">
                        <div className="grid grid-cols-2 gap-3">
                            {/* Google 로그인 버튼 */}
                            <Button
                                variant="outline"
                                className="h-11 gap-2 font-medium border-border/50 hover:bg-muted/50"
                                onClick={() => handleOAuthLogin('google')}
                                disabled={socialLoading === 'google'}
                            >
                                {socialLoading === 'google' ? (
                                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                )}
                                Google
                            </Button>

                            {/* Apple 로그인 버튼 */}
                            <Button
                                variant="outline"
                                className="h-11 gap-2 font-medium border-border/50 hover:bg-muted/50"
                                onClick={() => handleOAuthLogin('apple')}
                                disabled={socialLoading === 'apple'}
                            >
                                {socialLoading === 'apple' ? (
                                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                                    </svg>
                                )}
                                Apple
                            </Button>
                        </div>
                    </CardContent>

                    {/* 회원가입/로그인 전환 링크 */}
                    <CardFooter className="justify-center pb-6">
                        <p className="text-sm text-muted-foreground">
                            {isSignUp ? (
                                <>
                                    이미 계정이 있으신가요?{' '}
                                    <button
                                        onClick={() => setIsSignUp(false)}
                                        className="text-primary font-semibold hover:underline"
                                    >
                                        로그인
                                    </button>
                                </>
                            ) : (
                                <>
                                    계정이 없으신가요?{' '}
                                    <button
                                        onClick={() => setIsSignUp(true)}
                                        className="text-primary font-semibold hover:underline"
                                    >
                                        회원가입
                                    </button>
                                </>
                            )}
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
