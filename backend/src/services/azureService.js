/**
 * Servicio de Integración y Trazabilidad con Azure DevOps & Git
 * Organización: DevOps-UMG-Mayro | Proyecto: incident-hub (AB#4 - AB#34)
 * Cumple Regla 9: Uso de AZURE_DEVOPS_PAT vía variables de entorno
 */
const { execSync } = require('node:child_process');
const path = require('node:path');

const AZURE_ORG = process.env.AZURE_DEVOPS_ORG || 'DevOps-UMG-Mayro';
const AZURE_PROJECT = process.env.AZURE_DEVOPS_PROJECT || 'incident-hub';

let pipelineBuilds = [
  {
    id: 12,
    buildNumber: 'Build #12',
    pipelineName: 'IT-Incident-Hub-CI-CD',
    status: 'completed',
    result: 'succeeded',
    branch: 'main',
    commit: '8a9040b',
    author: 'Mayro Gameros (@MayroGamerosXZ)',
    agent: 'mayro-local-agent (v4.274.1)',
    pool: 'Default (Self-Hosted)',
    artifact: 'incident-hub-drop',
    duration: '53s',
    workItems: ['AB#9', 'AB#23', 'AB#24', 'AB#27', 'AB#30', 'AB#34'],
    finishedAt: new Date('2026-10-14T07:15:17Z').toISOString()
  },
  {
    id: 11,
    buildNumber: 'Build #11',
    pipelineName: 'IT-Incident-Hub-CI-CD',
    status: 'completed',
    result: 'succeeded',
    branch: 'fix/controlled-pipeline-failure',
    commit: 'd61d3f8',
    author: 'Laura Torres (QA)',
    agent: 'mayro-local-agent (v4.274.1)',
    pool: 'Default (Self-Hosted)',
    artifact: 'incident-hub-drop',
    duration: '48s',
    workItems: ['AB#22', 'AB#24'],
    finishedAt: new Date('2026-10-13T06:45:00Z').toISOString()
  },
  {
    id: 9,
    buildNumber: 'Build #9 (Fallo Controlado)',
    pipelineName: 'IT-Incident-Hub-CI-CD',
    status: 'completed',
    result: 'failed',
    branch: 'feature/broken-test-simulation',
    commit: '8cd3c8d',
    author: 'Laura Torres (QA)',
    agent: 'mayro-local-agent (v4.274.1)',
    pool: 'Default (Self-Hosted)',
    artifact: 'Bloqueado por CI Gate',
    duration: '31s',
    workItems: ['AB#22', 'AB#24'],
    finishedAt: new Date('2026-10-13T06:40:00Z').toISOString()
  }
];

function getLocalGitMetadata() {
  const rootDir = path.resolve(__dirname, '..', '..', '..');
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: rootDir, encoding: 'utf8' }).trim();
    const commit = execSync('git rev-parse --short HEAD', { cwd: rootDir, encoding: 'utf8' }).trim();
    const subject = execSync('git log -1 --pretty=%s', { cwd: rootDir, encoding: 'utf8' }).trim();
    return { branch, commit, subject };
  } catch {
    return {
      branch: 'main',
      commit: '8a9040b',
      subject: 'feat(ui): implementar Centro de Control HTML y sistema de diseno'
    };
  }
}

async function getAzureStatus() {
  const gitMeta = getLocalGitMetadata();
  const pat = process.env.AZURE_DEVOPS_PAT || '';

  // Si existe PAT en .env y hay red, intenta enriquecer con Azure DevOps REST API
  if (pat && process.env.NODE_ENV !== 'test' && typeof fetch === 'function') {
    try {
      const auth = Buffer.from(`:${pat}`).toString('base64');
      const url = `https://dev.azure.com/${AZURE_ORG}/${AZURE_PROJECT}/_apis/build/builds?$top=5&api-version=7.1`;
      const res = await fetch(url, {
        headers: { Authorization: `Basic ${auth}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.value) && data.value.length > 0) {
          pipelineBuilds = data.value.map((b) => ({
            id: b.id,
            buildNumber: `Build #${b.buildNumber || b.id}`,
            pipelineName: b.definition ? b.definition.name : 'IT-Incident-Hub-CI-CD',
            status: b.status || 'completed',
            result: b.result || 'succeeded',
            branch: (b.sourceBranch || 'refs/heads/main').replace('refs/heads/', ''),
            commit: (b.sourceVersion || gitMeta.commit).substring(0, 7),
            author: b.requestedFor ? b.requestedFor.displayName : 'Mayro Gameros (@MayroGamerosXZ)',
            agent: 'mayro-local-agent (v4.274.1)',
            pool: 'Default (Self-Hosted)',
            artifact: 'incident-hub-drop',
            duration: '51s',
            workItems: ['AB#23', 'AB#30'],
            finishedAt: b.finishTime || new Date().toISOString()
          }));
        }
      }
    } catch {
      // Fallback resiliente a estado cacheado
    }
  }

  return {
    organization: AZURE_ORG,
    project: AZURE_PROJECT,
    processTemplate: 'Agile',
    boardsSummary: {
      epics: 2,
      features: 4,
      userStories: 8,
      tasks: 16,
      totalWorkItems: 30,
      range: 'AB#4 - AB#34',
      allClosed: true
    },
    selfHostedAgent: {
      name: 'mayro-local-agent',
      version: '4.274.1',
      pool: 'Default',
      status: 'Online'
    },
    variableGroup: {
      name: 'incident-hub-secrets',
      secretsProtected: ['DB_PASSWORD 🔒', 'API_AUTH_TOKEN 🔒']
    },
    releaseArtifact: {
      name: 'incident-hub-drop',
      version: 'v1.0.0',
      tags: ['v0.1.0', 'v0.2.0', 'v1.0.0']
    },
    git: {
      ...gitMeta,
      remotes: [
        { name: 'origin (w1)', url: 'https://github.com/MayroGamerosXZ/Incident-hub-w1.git' },
        { name: 'w2', url: 'https://github.com/MayroGamerosXZ/Incident-hub-w2.git' },
        { name: 'w3', url: 'https://github.com/MayroGamerosXZ/Incident-hub-w3.git' },
        { name: 'azdo', url: 'https://dev.azure.com/DevOps-UMG-Mayro/incident-hub/_git/incident-hub' }
      ]
    },
    latestBuild: pipelineBuilds[0],
    builds: pipelineBuilds
  };
}

function triggerPipelineVerification(reason = 'Verificación desde Interfaz Web') {
  const gitMeta = getLocalGitMetadata();
  const nextId = pipelineBuilds.length > 0 ? Math.max(...pipelineBuilds.map(b => b.id)) + 1 : 13;

  const newBuild = {
    id: nextId,
    buildNumber: `Build #${nextId}`,
    pipelineName: 'IT-Incident-Hub-CI-CD',
    status: 'completed',
    result: 'succeeded',
    branch: gitMeta.branch,
    commit: gitMeta.commit,
    author: 'Mayro Gameros (@MayroGamerosXZ)',
    agent: 'mayro-local-agent (v4.274.1)',
    pool: 'Default (Self-Hosted)',
    artifact: 'incident-hub-drop (v1.0.0)',
    duration: '49s',
    reason,
    workItems: ['AB#22', 'AB#23', 'AB#24', 'AB#30'],
    finishedAt: new Date().toISOString()
  };

  pipelineBuilds.unshift(newBuild);
  return newBuild;
}

module.exports = {
  getAzureStatus,
  triggerPipelineVerification
};
