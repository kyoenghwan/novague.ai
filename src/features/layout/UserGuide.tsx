'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function UserGuide() {
    const [open, setOpen] = useState(false);
    useEffect(() => {
        if (!localStorage.getItem('hasSeenVibeGuide')) {
            setOpen(true);
            localStorage.setItem('hasSeenVibeGuide', 'true');
        }
    }, []);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader><DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tighter"><Sparkles className="w-5 h-5 text-primary" /> Guide</DialogTitle><DialogDescription>Welcome to NoVague AI.</DialogDescription></DialogHeader>
                <div className="py-4 text-sm text-muted-foreground leading-relaxed">디자이너의 의도를 명확하게 AI에게 전달하여 완벽한 코드를 완성하세요.</div>
                <Button onClick={() => setOpen(false)} className="w-full">Get Started</Button>
            </DialogContent>
        </Dialog>
    );
}
