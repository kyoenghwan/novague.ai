// Imports
import { cn } from '@/lib/utils';
import {
    Lightbulb,
    GitBranch,
    Database,
    Component,
    ShieldCheck,
    Layout,
    CheckCircle2,
    Circle
} from 'lucide-react';

interface StageSidebarProps {
    currentStage: number;
    onStageSelect: (stage: 0 | 1 | 2 | 3 | 4 | 5 | 6) => void;
    stagesCompleted: boolean[];
}

const STAGES = [
    { id: 0, label: '아이디어', icon: Lightbulb, description: '프로젝트 구상' },
    { id: 1, label: '분석', icon: Layout, description: 'AI 프로젝트 분석' },
    { id: 2, label: 'UX 설계', icon: GitBranch, description: '화면 흐름도' },
    { id: 3, label: '데이터', icon: Database, description: 'DB 및 API' },
    { id: 4, label: '컴포넌트', icon: Component, description: 'UI 컴포넌트' },
    { id: 5, label: '검증', icon: ShieldCheck, description: '통합 테스트' },
    { id: 6, label: '시각화', icon: Layout, description: '최종 결과물' },
];

export default function StageSidebar({ currentStage, onStageSelect, stagesCompleted }: StageSidebarProps) {
    return (
        <aside className="w-64 border-r bg-muted/30 flex flex-col h-full overflow-hidden">
            <div className="p-6">
                <h2 className="text-lg font-bold mb-1">Project Flow</h2>
                <p className="text-xs text-muted-foreground">AI-Driven Development Pipeline</p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4">
                <div className="relative">
                    {/* Connecting Line */}
                    <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-border/50 -z-10" />

                    <div className="space-y-6">
                        {STAGES.map((stage, index) => {
                            const isActive = currentStage === stage.id;
                            const isCompleted = stagesCompleted[stage.id];
                            const isAccessible = isCompleted || currentStage >= stage.id || (index > 0 && stagesCompleted[index - 1]);

                            return (
                                <div
                                    key={stage.id}
                                    className={cn(
                                        "relative flex items-start gap-4 group transition-all duration-300",
                                        isAccessible ? "cursor-pointer" : "opacity-50 cursor-not-allowed"
                                    )}
                                    onClick={() => isAccessible && onStageSelect(stage.id as any)}
                                >
                                    {/* Status Indicator */}
                                    <div className={cn(
                                        "flex-none w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all z-10 bg-background",
                                        isActive ? "border-primary text-primary ring-2 ring-primary/20 ring-offset-2" :
                                            isCompleted ? "border-green-500 text-green-500 bg-green-500/10" :
                                                "border-muted-foreground/30 text-muted-foreground"
                                    )}>
                                        {isCompleted && !isActive ? (
                                            <CheckCircle2 className="w-5 h-5" />
                                        ) : (
                                            <stage.icon className="w-5 h-5" />
                                        )}
                                    </div>

                                    {/* Text Content */}
                                    <div className="pt-1">
                                        <div className={cn(
                                            "font-semibold text-sm transition-colors",
                                            isActive ? "text-primary" : "text-foreground"
                                        )}>
                                            {stage.label}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {stage.description}
                                        </div>
                                    </div>

                                    {isActive && (
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-l-full" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="p-4 border-t bg-background/50 text-[10px] text-muted-foreground text-center">
                v2.0 Beta
            </div>
        </aside>
    );
}
