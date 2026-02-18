# Vibe Coding Manager

**"Developers design, AI builds."**

Vibe Coding Manager는 개발자가 시각적 다이어그램을 통해 프로젝트 구조를 설계하면, AI 코딩 도구(Cursor, Windsurf 등)를 위한 최적의 프롬프트를 자동으로 생성해주는 도구입니다.

## ✨ 주요 기능

- **시각적 설계**: React Flow 기반의 직관적인 노드 다이어그램 (Page, Component, API, Database)
- **AI 프롬프트 생성**: 설계된 구조와 명세를 바탕으로 고품질의 개발 프롬프트 자동 생성 및 복사
- **자동 저장**: Supabase 연동을 통한 실시간 클라우드 저장 및 데이터 영속성
- **프로젝트 관리**: 다수의 프로젝트 생성 및 관리, 기술 스택 정의
- **사용자 편의성**: 다크 모드, 키보드 단축키(Ctrl+S 저장, Delete 삭제), Drag & Drop 인터페이스

## 🛠️ 기술 스택

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
- **Diagram**: [React Flow](https://reactflow.dev/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (+ Immer, Persist)
- **Backend/Auth**: [Supabase](https://supabase.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 시작하기

### 1. 레포지토리 클론

\`\`\`bash
git clone https://github.com/your-username/vibe-coding-manager.git
cd vibe-coding-manager
\`\`\`

### 2. 패키지 설치

\`\`\`bash
npm install
\`\`\`

### 3. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env.local` 파일을 생성하고 Supabase 키를 입력하세요.

\`\`\`bash
cp .env.example .env.local
\`\`\`

**Note**: Supabase 프로젝트 설정이 필요합니다. `supabase/schema.sql`을 실행하여 테이블을 생성하세요.

### 4. 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하세요.

## 📖 사용 가이드

1.  **로그인**: 우측 패널 상단의 로그인 버튼을 통해 계정을 생성하거나 로그인합니다.
2.  **노드 추가**: 좌측 사이드바에서 원하는 컴포넌트(Page, Component 등)를 드래그하여 중앙 캔버스에 놓습니다.
3.  **속성 편집**: 추가된 노드를 클릭하면 우측 패널에서 상세 명세(이름, 설명, 요구사항 등)를 편집할 수 있습니다.
4.  **프롬프트 생성**: 우측 패널의 'Prompt Generator' 탭에서 생성된 프롬프트를 확인하고 복사합니다.
5.  **AI 도구 활용**: 복사한 프롬프트를 Cursor나 Windsurf의 채팅 창에 붙여넣어 코드를 생성합니다.

## 📂 폴더 구조

\`\`\`
src/
├── app/              # Next.js App Router 페이지
├── components/       # UI 컴포넌트
│   ├── diagram/      # React Flow 커스텀 노드 등
│   ├── layout/       # 헤더, 사이드바, 패널 레이아웃
│   └── ui/           # Shadcn UI 컴포넌트
├── lib/              # 유틸리티 및 클라이언트 설정 (Supabase, Utils)
├── store/            # 전역 상태 관리 (Zustand)
├── types/            # TypeScript 타입 정의
└── ...
\`\`\`

## 🤝 기여하기

이슈 리포트와 풀 리퀘스트는 언제나 환영합니다!

## 📄 라이선스

MIT License
