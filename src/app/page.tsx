'use client';

import React, { useEffect } from 'react';
import { useProjectStore } from '@/store/projectStore';
import ProjectDiagram from '@/components/ProjectDiagram';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import RightPanel from '@/components/layout/RightPanel';
import Auth from '@/components/Auth';
import { UserGuide } from '@/components/UserGuide';
import StageSidebar from '@/components/layout/StageSidebar';
import ProjectListSidebar from '@/components/layout/ProjectListSidebar';
import GlobalSidebar from '@/components/layout/GlobalSidebar';
import dynamic from 'next/dynamic';

// Wrappers for dynamic imports
const ProjectInitializerWrapper = dynamic(() => import('@/components/v2/ProjectInitializer'), { ssr: false });
const AnalysisResultCardWrapper = dynamic(() => import('@/components/v2/AnalysisResultCard'), { ssr: false });
const UXFlowchartWrapper = dynamic(() => import('@/components/v2/UXFlowchart'), { ssr: false });
const DataSchemaDesignerWrapper = dynamic(() => import('@/components/v2/DataSchemaDesigner'), { ssr: false });
const ComponentArchitectureViewerWrapper = dynamic(() => import('@/components/v2/ComponentArchitectureViewer'), { ssr: false });
const IntegrationValidatorWrapper = dynamic(() => import('@/components/v2/IntegrationValidator'), { ssr: false });
const VisualizationEngineWrapper = dynamic(() => import('@/components/v2/VisualizationEngine'), { ssr: false });

export default function Home() {
  const { currentProject, createProject, saveProject, isLoading, deleteNode, selectedNode, globalAIConfig } = useProjectStore();

  // v2.0 State
  // 0: Initializer, 1: Analysis, 2: UX, 3: Data, 4: Components, 5: Validator, 6: Visualization (Final)
  const [stage, setStage] = React.useState<0 | 1 | 2 | 3 | 4 | 5 | 6>(0);
  const [projectAnalysis, setProjectAnalysis] = React.useState<any>(null);
  const [uxAnalysis, setUxAnalysis] = React.useState<any>(null);
  const [dataArchitecture, setDataArchitecture] = React.useState<any>(null);
  const [componentArchitecture, setComponentArchitecture] = React.useState<any>(null);
  const [validationResult, setValidationResult] = React.useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<any>(null);

  // Auth State Listener
  useEffect(() => {
    const { supabase } = require('@/lib/supabaseClient');

    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setCurrentUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Stage 0 -> 1: Analyze Idea
  const handleIdeaSubmit = async (idea: string) => {
    setIsAnalyzing(true);
    try {
      const { analyzeProject } = await import('@/lib/ai/projectManager');
      const analysis = await analyzeProject(idea, globalAIConfig);
      setProjectAnalysis(analysis);
      setStage(1);
      setActiveGlobalTab('projects'); // Switch to workspace view
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Stage 1 -> 2: Approve Analysis & Start UX Design
  const handleApproveAnalysis = async () => {
    if (!projectAnalysis) return;
    setIsAnalyzing(true);
    try {
      const { analyzeUX } = await import('@/lib/ai/uxArchitect');
      const ux = await analyzeUX(projectAnalysis);
      setUxAnalysis(ux);
      setStage(2);
    } catch (error) {
      console.error("UX Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Stage 2 -> 3: Approve UX & Start Data Architecture
  const handleApproveUX = async () => {
    if (!projectAnalysis || !uxAnalysis) return;
    setIsAnalyzing(true);
    try {
      const { analyzeData } = await import('@/lib/ai/dataArchitect');
      const data = await analyzeData(projectAnalysis, uxAnalysis);
      setDataArchitecture(data);
      setStage(3);
    } catch (error) {
      console.error("Data Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Stage 3 -> 4: Approve Data & Start Component Architecture
  const handleApproveData = async () => {
    if (!uxAnalysis || !dataArchitecture) return;
    setIsAnalyzing(true);
    try {
      const { analyzeComponents } = await import('@/lib/ai/componentArchitect');
      const components = await analyzeComponents(uxAnalysis, dataArchitecture);
      setComponentArchitecture(components);
      setStage(4);
    } catch (error) {
      console.error("Component Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Stage 4 -> 5: Approve Components & Start Validation
  const handleApproveComponents = async () => {
    if (!projectAnalysis || !uxAnalysis || !dataArchitecture || !componentArchitecture) return;
    setIsAnalyzing(true);
    try {
      const { validateIntegration } = await import('@/lib/ai/integrationValidator');
      const result = await validateIntegration(projectAnalysis, uxAnalysis, dataArchitecture, componentArchitecture);
      setValidationResult(result);
      setStage(5);
    } catch (error) {
      console.error("Validation failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Stage 5 -> 6: Approve Validation & Start Visualization (Final Stage)
  const handleApproveValidation = () => {
    if (!projectAnalysis) return;

    // In Stage 6, we just visualize. Project creation might happen inside Stage 6 or be implicitly done.
    // Use existing logic for now to ensure persistence.
    createProject(
      projectAnalysis.projectName,
      projectAnalysis.summary,
      [
        projectAnalysis.techStack.frontend.framework,
        projectAnalysis.techStack.backend.platform,
        projectAnalysis.techStack.backend.database
      ]
    );
    setStage(6);
  };

  // Auto-save logic (Stage 6)
  useEffect(() => {
    if (stage !== 6) return;
    const interval = setInterval(() => {
      if (currentProject) saveProject();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentProject, saveProject, stage]);

  // Keyboard shortcuts (Stage 6)
  useEffect(() => {
    if (stage !== 6) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveProject();
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNode) {
        const activeElement = document.activeElement;
        const isInput = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';
        if (!isInput) deleteNode(selectedNode.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, saveProject, deleteNode, selectedNode]);

  // Global Sidebar Tab State
  const [activeGlobalTab, setActiveGlobalTab] = React.useState<'home' | 'projects' | 'hub'>('home');
  const [showAuth, setShowAuth] = React.useState(false);

  const SettingsDialog = dynamic(() => import('@/components/SettingsDialog'), { ssr: false });

  const [showSettings, setShowSettings] = React.useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground relative">
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />

      {/* Auth Overlay */}
      {showAuth && (
        <div className="absolute inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAuth(false)}>
          <div className="max-w-md w-full" onClick={e => e.stopPropagation()}>
            <Auth />
          </div>
        </div>
      )}

      {/* 1. Global Sidebar (Always Visible) */}
      <GlobalSidebar
        activeTab={activeGlobalTab}
        onTabChange={setActiveGlobalTab}
        onProfileClick={() => setShowAuth(true)}
        onSettingsClick={() => setShowSettings(true)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative bg-background">

        {/* Project List Sidebar (Visible only when 'projects' tab is active) */}
        {activeGlobalTab === 'projects' && (
          <ProjectListSidebar />
        )}

        {/* Hub Sidebar Placeholder */}
        {activeGlobalTab === 'hub' && (
          <aside className="w-[260px] flex-none border-r bg-muted/30 p-4">
            <h2 className="font-semibold mb-4">Community Hub</h2>
            <div className="text-sm text-muted-foreground">Coming Soon...</div>
          </aside>
        )}

        <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-50 dark:bg-[#0F1117]">
          {/* Loading Overlay */}
          {isAnalyzing && (
            <div className="absolute inset-0 z-[100] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-lg font-medium animate-pulse text-foreground">AI Architect is designing...</p>
            </div>
          )}

          {/* Stage 0: Initializer or Welcome (Visible on Home tab or Stage 0) */}
          {(stage === 0 || activeGlobalTab === 'home') && !activeGlobalTab.match(/projects|hub/) && (
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
              {!currentUser ? (
                <div className="max-w-md w-full text-center space-y-6">
                  <div className="space-y-2">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto flex items-center justify-center mb-4">
                      <span className="font-bold text-3xl text-primary">N</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome to NoVague</h1>
                    <p className="text-muted-foreground">Sign in to start designing your next big idea with clear specs.</p>
                  </div>
                  <Auth />
                </div>
              ) : (
                <div className="flex-1 h-full overflow-hidden">
                  <ProjectInitializerWrapper
                    onComplete={handleIdeaSubmit}
                    aiConfig={globalAIConfig}
                    userId={currentUser?.id}
                  />
                </div>
              )}
            </div>
          )}

          {/* Stage > 0: Project Workspace (Visible when in Project tab or active stage) */}
          {stage > 0 && activeGlobalTab !== 'home' && (
            <div className="flex h-full w-full overflow-hidden">
              {/* Stage Progress Sidebar */}
              <StageSidebar
                currentStage={stage}
                onStageSelect={setStage}
                stagesCompleted={[
                  true,
                  !!projectAnalysis,
                  !!uxAnalysis,
                  !!dataArchitecture,
                  !!componentArchitecture,
                  !!validationResult,
                  false
                ]}
              />

              {/* Stage Content */}
              <div className="flex-1 overflow-hidden relative flex flex-col">
                {/* Header for Workspace */}
                <div className="h-14 flex-none border-b bg-background flex items-center justify-between px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{projectAnalysis?.projectName || 'New Project'}</span>
                    <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">Stage {stage}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Tools like Save, AI Settings can go here */}
                    <Header />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto relative">
                  {stage === 1 && projectAnalysis && (
                    <div className="p-0 h-full">
                      <AnalysisResultCardWrapper
                        analysis={projectAnalysis}
                        onApprove={handleApproveAnalysis}
                        onRetry={() => setStage(0)}
                      />
                    </div>
                  )}

                  {stage === 2 && uxAnalysis && (
                    <UXFlowchartWrapper
                      analysis={uxAnalysis}
                      onApprove={handleApproveUX}
                      onModify={() => console.log("Modify UX")}
                    />
                  )}

                  {stage === 3 && dataArchitecture && (
                    <DataSchemaDesignerWrapper
                      architecture={dataArchitecture}
                      onApprove={handleApproveData}
                      onModify={() => console.log("Modify Data")}
                    />
                  )}

                  {stage === 4 && componentArchitecture && (
                    <ComponentArchitectureViewerWrapper
                      architecture={componentArchitecture}
                      onApprove={handleApproveComponents}
                      onModify={() => console.log("Modify Components")}
                    />
                  )}

                  {stage === 5 && validationResult && (
                    <IntegrationValidatorWrapper
                      result={validationResult}
                      onApprove={handleApproveValidation}
                      onFix={() => console.log("Auto-Fix")}
                    />
                  )}

                  {stage === 6 && (
                    <VisualizationEngineWrapper
                      projectAnalysis={projectAnalysis}
                      uxAnalysis={uxAnalysis}
                      dataArchitecture={dataArchitecture}
                      componentArchitecture={componentArchitecture}
                      validationResult={validationResult}
                      onReset={() => setStage(0)}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
