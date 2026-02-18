import { Project, ComponentNode } from '@/types';

/**
 * 컴포넌트 개발을 위한 AI 프롬프트를 생성하는 함수
 * 
 * @param component 대상 컴포넌트 노드
 * @param project 전체 프로젝트 컨텍스트
 * @returns 생성된 프롬프트 문자열
 */
export function generateComponentPrompt(component: ComponentNode, project: Project): string {
    if (!component || !component.data) {
        throw new Error('유효하지 않은 컴포넌트 데이터입니다.');
    }

    if (!project) {
        throw new Error('유효하지 않은 프로젝트 데이터입니다.');
    }

    const { data } = component;
    const techStack = project.techStack.length > 0 ? project.techStack.join(', ') : '지정되지 않음';
    const requirements = data.requirements.length > 0
        ? data.requirements.map(req => `- ${req}`).join('\n')
        : '- (작성된 요구사항 없음)';

    const framework = data.techSpec?.framework || '지정되지 않음';
    const styling = data.techSpec?.styling || '지정되지 않음';

    // 템플릿 리터럴을 사용하여 프롬프트 구성
    return `[프로젝트 컨텍스트]

프로젝트명: ${project.name}
기술 스택: ${techStack}
설명: ${project.description}

[컴포넌트 명세]

이름: ${data.label}
타입: ${data.type}
위치: ${data.filePath || '(경로 미지정)'}
설명: ${data.description || '(설명 없음)'}

[기능 요구사항]
${requirements}

[기술 명세]

프레임워크: ${framework}
스타일링: ${styling}

위 명세에 따라 완성된 ${data.label} 컴포넌트를 구현해주세요.
TypeScript + React로 작성하고, 코드에는 자세한 주석(JSDoc 포함)과 사용법 예시를 포함해주세요.
기존 프로젝트 구조와 스타일링 규칙(Tailwind CSS 등)을 준수해주세요.`;
}
