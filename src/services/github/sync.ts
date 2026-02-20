'use server';

import { Project, ComponentNode, ComponentEdge, GitHubConfig } from '@/types';

interface ProjectSpec {
    project: {
        name: string;
        description: string;
        techStack: string[];
        lastUpdated: string;
    };
    screens: any[];
    components: any[];
    apis: any[];
}

/**
 * Syncs the project specification to the configured GitHub repository.
 */
export async function syncProjectSpec(project: Project): Promise<void> {
    if (!project.githubConfig || !project.githubConfig.token) {
        throw new Error("GitHub configuration missing or incomplete.");
    }

    const specData: ProjectSpec = {
        project: {
            name: project.name,
            description: project.description,
            techStack: project.techStack,
            lastUpdated: new Date().toISOString()
        },
        screens: project.nodes
            .filter(n => n.data.type === 'page')
            .map(screen => ({
                id: screen.id,
                name: screen.data.label,
                route: screen.data.filePath,
                description: screen.data.description,
                components: getConnectedComponents(screen.id, project.edges, project.nodes)
            })),
        components: project.nodes
            .filter(n => n.data.type === 'component')
            .map(comp => ({
                id: comp.id,
                name: comp.data.label,
                filePath: comp.data.filePath,
                description: comp.data.description,
                requirements: comp.data.requirements,
                dependencies: getComponentDependencies(comp.id, project.edges, project.nodes)
            })),
        apis: project.nodes
            .filter(n => n.data.type === 'api')
            .map(api => ({
                id: api.id,
                endpoint: api.data.label,
                method: (api.data as any).method || 'GET', // Assuming method might be in data
                description: api.data.description
            }))
    };

    try {
        await updateGitHubFile(
            project.githubConfig,
            'vibe-spec/project.json',
            JSON.stringify(specData, null, 2)
        );
        await updateGitHubFile(
            project.githubConfig,
            'vibe-spec/README.md',
            generateSpecReadme(specData)
        );
    } catch (error) {
        console.error("Failed to sync to GitHub:", error);
        throw error;
    }
}

/**
 * Helper to find components connected to a screen (Screen -> Component)
 */
function getConnectedComponents(screenId: string, edges: ComponentEdge[], nodes: ComponentNode[]) {
    // Find edges where source is screenId
    const connectedComponentIds = edges
        .filter(e => e.source === screenId)
        .map(e => e.target);

    return nodes
        .filter(n => connectedComponentIds.includes(n.id) && n.data.type === 'component')
        .map(n => ({
            id: n.id,
            name: n.data.label
        }));
}

/**
 * Helper to find dependencies of a component (Component -> Component/API)
 */
function getComponentDependencies(compId: string, edges: ComponentEdge[], nodes: ComponentNode[]) {
    const dependencyIds = edges
        .filter(e => e.source === compId)
        .map(e => e.target);

    return nodes
        .filter(n => dependencyIds.includes(n.id))
        .map(n => ({
            id: n.id,
            name: n.data.label,
            type: n.data.type
        }));
}

/**
 * Updates or creates a file in the GitHub repository.
 */
async function updateGitHubFile(config: GitHubConfig, path: string, content: string) {
    const { owner, repo, token, branch = 'main' } = config;
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    // 1. Get current SHA if file exists
    let sha: string | undefined;
    try {
        const response = await fetch(url + `?ref=${branch}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });
        if (response.ok) {
            const data = await response.json();
            sha = data.sha;
        }
    } catch (e) {
        // File likely doesn't exist
    }

    // 2. Create or Update file
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: `Update ${path} via Vibe Coding Manager`,
            content: Buffer.from(content).toString('base64'), // Node.js Buffer
            sha: sha,
            branch: branch
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub API Error: ${errorData.message}`);
    }
}

/**
 * Generates a Markdown README from the spec data.
 */
function generateSpecReadme(spec: ProjectSpec): string {
    return `
# ${spec.project.name} - Project Specification

**Description**: ${spec.project.description}
**Last Updated**: ${new Date(spec.project.lastUpdated).toLocaleString()}

## Tech Stack
${spec.project.techStack.map(t => `- ${t}`).join('\n')}

## Screens
${spec.screens.map(s => `
### ${s.name} (${s.route})
- **Description**: ${s.description}
- **Components**:
  ${s.components.map((c: any) => `- ${c.name}`).join('\n  ')}
`).join('\n')}

## Components
${spec.components.map(c => `
### ${c.name}
- **File**: \`${c.filePath}\`
- **Description**: ${c.description}
- **Requirements**:
  ${c.requirements ? c.requirements.map((r: string) => `- ${r}`).join('\n  ') : '- None'}
`).join('\n')}

## API Endpoints
${spec.apis.map(a => `
### ${a.method} ${a.endpoint}
- ${a.description}
`).join('\n')}

---
*Generated by Vibe Coding Manager*
`.trim();
}
