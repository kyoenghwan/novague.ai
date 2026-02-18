import { Node, Edge } from 'reactflow';

/**
 * 컴포넌트 데이터 구조
 * Node의 data 속성에 들어갈 타입
 */
export interface ComponentData {
  /** 노드에 표시될 라벨 (이름) */
  label: string;
  /** 노드 타입 구분 */
  type: 'page' | 'component' | 'api' | 'database';
  /** 컴포넌트/페이지에 대한 상세 설명 */
  description: string;
  /** 구현해야 할 기능 요구사항 목록 */
  requirements: string[];
  /** 기술 스택 명세 */
  techSpec: {
    framework: string;
    styling: string;
    stateManagement: string;
  };
  /** 실제 파일 경로 (예: /components/auth/LoginForm.tsx) */
  filePath: string;
}

/**
 * React Flow Node 확장 타입
 * 제네릭으로 ComponentData를 주입하여 data 속성 타입 안전성 보장
 */
export type ComponentNode = Node<ComponentData>;

/**
 * React Flow Edge 확장 타입
 * 관계의 성격을 정의하는 type 속성 확장
 */
export type ComponentEdge = Edge & {
  type: 'dependency' | 'dataFlow' | 'navigation';
};

/**
 * 프로젝트 전체 구조 정의
 */
export interface Project {
  /** 프로젝트 고유 ID (UUID) */
  id: string;
  /** 프로젝트 이름 */
  name: string;
  /** 프로젝트 설명 */
  description: string;
  /** 프로젝트 전체에서 사용하는 기술 스택 */
  techStack: string[];
  /** 다이어그램에 포함된 모든 노드 */
  nodes: ComponentNode[];
  /** 다이어그램에 포함된 모든 엣지(연결) */
  edges: ComponentEdge[];
  /** 생성 일시 */
  createdAt?: number; // Unix timestamp
  /** 프로젝트 소유자 ID */
  author?: string; // e.g. "AI", "User"
  /** 마지막 수정 일시 (선택적) */
  updatedAt?: Date;
  /** AI 설정 (선택적) */
  aiConfig?: AIConfig;
  /** GitHub 설정 (선택적) */
  githubConfig?: GitHubConfig;
}

export interface GitHubConfig {
  owner: string;
  repo: string;
  branch?: string; // default: main
  token?: string; // saved locally or per session
}

// --- AI Configuration Types ---

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'mistral' | 'custom';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  contextWindow: number;
}

export interface AIConfig {
  provider: AIProvider;
  model: string;
  apiKey: string;
  baseUrl?: string; // For custom providers or proxies
  temperature?: number;
  maxTokens?: number;
}

export const SUPPORTED_AI_MODELS: AIModel[] = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', contextWindow: 128000 },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', contextWindow: 128000 },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', contextWindow: 16000 },
  { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet', provider: 'anthropic', contextWindow: 200000 },

  // Google Gemini Models (Updated IDs)
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite', provider: 'google', contextWindow: 1000000 },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google', contextWindow: 2000000 },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'google', contextWindow: 2000000 },
];

// --- v2.0 Project Manager AI Types ---

export interface UserRole {
  name: string;
  permissions: string[];
  description: string;
}

export interface TechStack {
  frontend: {
    framework: string;      // Next.js, React Native, Flutter
    language: string;       // TypeScript, Dart
    styling: string;        // Tailwind CSS, styled-components
    stateManagement: string; // Zustand, Redux Toolkit
  };
  backend: {
    type: 'serverless' | 'traditional' | 'microservices';
    platform: string;       // Supabase, Firebase, Node.js
    database: string;       // PostgreSQL, MongoDB
    authentication: string; // Supabase Auth, Auth0
  };
  deployment: {
    frontend: string;       // Vercel, Netlify
    backend: string;        // Railway, AWS
    cdn: string;           // Cloudflare, AWS CloudFront
  };
}

export interface AnalysisReasoning {
  techStackReason: string;
  architectureReason: string;
  complexityReason: string;
}

export interface ProjectAnalysis {
  // 프로젝트 기본 정보
  projectName: string;
  summary: string;
  projectType: 'web' | 'mobile' | 'desktop' | 'api' | 'hybrid';

  // 기술 스택 결정
  techStack: TechStack;

  // 비즈니스 로직
  coreFeatures: string[];
  userRoles: UserRole[];
  businessRules: string[];

  // 프로젝트 메타데이터
  estimatedComplexity: 'simple' | 'medium' | 'complex';
  developmentTime: string;
  teamSize: string;

  // AI 판단 근거
  reasoning: AnalysisReasoning;
}

// --- v2.0 Stage 2: UX Architect AI Types ---

export interface FlowStep {
  screen: string;
  action: string;
  condition?: string;
  nextScreen: string;
}

export interface UserFlow {
  id: string;
  name: string;
  steps: FlowStep[];
  alternativeFlows: FlowStep[][];
}

export interface BackgroundProcess {
  id: string;
  name: string;
  type: 'webhook' | 'cron' | 'realtime' | 'queue';
  trigger: string;
  description: string;
  relatedScreens: string[];
}

export interface Screen {
  id: string;
  name: string;
  type: 'page' | 'modal' | 'drawer' | 'overlay';
  route: string;
  description: string;

  // 사용자 스토리
  userStory: string;
  acceptanceCriteria: string[];

  // 화면 상태
  states: {
    loading: string;
    empty: string;
    error: string;
    success: string;
  };

  // 권한 및 접근성
  authentication: 'public' | 'protected' | 'admin';
  permissions: string[];

  // 성능 요구사항
  performanceTargets: {
    loadTime: string; // e.g. "1.5s"
    interactionDelay: string; // e.g. "100ms"
  };
}

export interface ScreenAnalysis {
  screens: Screen[];
  userFlows: UserFlow[];
  backgroundProcesses: BackgroundProcess[];
}

// --- v2.0 Stage 3: Data Architect AI Types ---

export interface DatabaseTable {
  name: string;
  description: string;
  fields: {
    name: string;
    type: string;
    constraints: string[];
    defaultValue?: any;
    description: string;
  }[];
  primaryKey: string;
  foreignKeys: string[];
}

export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  authentication: boolean;
  authorization: string[];

  request: {
    headers?: object;
    params?: object;
    body?: object;
  };

  response: {
    success: object;
    errors: object[];
  };

  businessLogic: string[];
  relatedTables: string[];
  usedByScreens: string[];
}

export interface DataFlow {
  id: string;
  name: string;
  source: string;
  destination: string;
  dataType: string;
  transformations: string[];
}

export interface DataArchitecture {
  database: {
    tables: DatabaseTable[];
    relationships: any[]; // Extended type can be added if needed
    indexes: any[];
    policies: string[]; // Simplification for MVP
  };
  apis: APIEndpoint[];
  dataFlows: DataFlow[];
}

// --- v2.0 Stage 4: Component Architect AI Types ---

export interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description: string;
  validation?: string;
}

export interface StateDefinition {
  name: string;
  type: string;
  initialValue: any;
  description: string;
}

export interface EventDefinition {
  name: string;
  payloadType?: string;
  description: string;
}

export interface MethodDefinition {
  name: string;
  parameters: { name: string; type: string }[];
  returnType: string;
  description: string;
}

export interface Component {
  id: string;
  name: string;
  type: 'layout' | 'feature' | 'ui' | 'form';
  filePath: string;

  // 컴포넌트 명세
  description: string;
  responsibility: string;

  // Props & State
  props: PropDefinition[];
  state: StateDefinition[];

  // 이벤트 & 메서드
  events: EventDefinition[];
  methods: MethodDefinition[];

  // 의존성
  dependencies: {
    components: string[];
    hooks: string[];
    apis: string[];
    libraries: string[];
  };

  // 스타일링
  styling: {
    framework: string;
    responsive: boolean;
    animations: string[];
    variants: string[];
  };

  // 테스트
  testScenarios: string[];
  mockData: any;

  // 성능
  estimatedComplexity: 'low' | 'medium' | 'high';
  rerenderOptimization: string[];
}

export interface LayoutComponent {
  name: string;
  filePath: string;
  description: string;
}

export interface ScreenComponents {
  screenId: string;
  layout: LayoutComponent;
  featComponents: Component[]; // 'features' renamed to avoid conflict or just Component[]
  uiComponents: Component[];
}

export interface SharedComponent extends Component {
  usageCount: number;
}

export interface ComponentLibraryItem {
  name: string;
  version: string;
  usage: string;
}

export interface ComponentArchitecture {
  screens: ScreenComponents[];
  sharedComponents: SharedComponent[];
  componentLibrary: ComponentLibraryItem[];
}

// --- v2.0 Stage 5: Integration Validator AI Types ---

export interface Issue {
  type: 'missing_dependency' | 'circular_dependency' | 'type_mismatch' | 'security_gap' | 'performance_issue' | 'accessibility';
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: string;
  description: string;
  solution: string;
  autoFixAvailable: boolean;
}

export interface Suggestion {
  category: 'architecture' | 'performance' | 'security' | 'maintainability';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
}

export interface Optimization {
  target: string;
  description: string;
  estimatedGain: string;
}

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100
  criticalIssues: Issue[];
  warnings: Issue[];
  suggestions: Suggestion[];
  optimizations: Optimization[];
}

/**
 * AI 프롬프트 생성을 위한 템플릿 구조
 */
export interface PromptTemplate {
  /** 템플릿 고유 ID */
  id: string;
  /** 템플릿 이름 (예: "React Component 생성") */
  name: string;
  /** 카테고리 (예: "Frontend", "Backend", "Test") */
  category: string;
  /** 템플릿 내용 (변수 치환을 위한 마커 포함 가능) */
  template: string;
}
