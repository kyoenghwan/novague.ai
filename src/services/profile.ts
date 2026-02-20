import { supabase } from './supabase-client';

export interface Profile {
    id: string;
    email: string | null;
    full_name?: string | null;
    avatar_url?: string | null;
    subscription_tier?: 'free' | 'pro' | 'enterprise';
    updated_at?: string;
}

export async function getProfile(userId: string): Promise<Profile | null> {
    console.log('[ProfileService] Fetching profile for:', userId);
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('[ProfileService] Error fetching profile:', error);
        return null;
    }
    console.log('[ProfileService] Profile found:', data);
    return data;
}

export async function ensureProfile(user: any): Promise<Profile | null> {
    if (!user) return null;

    console.log('[ProfileService] Ensuring profile for:', user.id);
    const existing = await getProfile(user.id);
    if (existing) {
        console.log('[ProfileService] Profile already exists');
        return existing;
    }

    const newProfile: Profile = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url,
        subscription_tier: 'free',
        updated_at: new Date().toISOString()
    };

    console.log('[ProfileService] Inserting new profile:', newProfile);
    const { data, error } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();

    if (error) {
        console.error('Error creating profile:', error);
        // If it's a conflict, try to fetch again
        if (error.code === '23505') {
            return await getProfile(user.id);
        }
        return null;
    }
    return data;
}
