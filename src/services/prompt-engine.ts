import { Project, ComponentNode, PropDefinition, APIEndpoint, DatabaseTable } from '@/types';

/**
 * 컴포넌트 데이터를 기반으로 AI 프롬프트 생성 (SDD 고도화 버전)
 */
export function generateComponentPrompt(component: ComponentNode, project: Project): string {
    const { data } = component;

    let prompt = `
# Role
You are a Senior Full-stack Developer.
Your task is to implement the following ${data.type} based on the Software Design Document (SDD).

# Project Context
- Project Name: ${project.name}
- Tech Stack: ${project.techStack.join(', ')}
- Root Tech Spec: ${data.techSpec.framework}, ${data.techSpec.styling}, ${data.techSpec.stateManagement}

# Component Specification
- Name: ${data.label}
- Description: ${data.description}
- File Path: ${data.filePath}

# Requirements
${data.requirements.map(req => `- ${req}`).join('\n')}
`;

    if (data.interfaces) {
        prompt += `\n# Interface Spec (Props & State)
## Props
${data.interfaces.props.map((p: PropDefinition) => `- ${p.name} (${p.type}): ${p.description}${p.required ? ' [Required]' : ''}`).join('\n')}

## Internal State
${data.interfaces.state.map(s => `- ${s.name} (${s.type}): ${s.description}`).join('\n')}
`;
    }

    if (data.endpoints && data.endpoints.length > 0) {
        prompt += `\n# API Endpoints
${data.endpoints.map((e: APIEndpoint) => `- [${e.method}] ${e.path}: ${e.description}`).join('\n')}
`;
    }

    if (data.tableSchema) {
        const t = data.tableSchema;
        prompt += `\n# Database Schema (Table: ${t.name})
- Primary Key: ${t.primaryKey}
${t.fields.map(f => `- ${f.name} (${f.type}): ${f.description}`).join('\n')}
`;
    }

    if (data.dependencies && data.dependencies.length > 0) {
        const depNames = data.dependencies.map(id => {
            const node = project.nodes.find(n => n.id === id);
            return node ? node.data.label : id;
        });
        prompt += `\n# Dependencies
- This component depends on: ${depNames.join(', ')}
`;
    }

    prompt += `
# Instructions
1. Follow the FSD (Feature-Sliced Design) architecture.
2. Use absolute imports using the '@/' alias.
3. Include detailed comments in Korean as per the user's global rules.
4. Keep the code clean, modular, and optimized for AI maintenance.
5. Do NOT use placeholders; implement the logic as described in the requirements.

Please provide the complete implementation for ${data.filePath}.
`;

    return prompt;
}
