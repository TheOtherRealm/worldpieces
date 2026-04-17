/**
 * World Pieces — Discipline metadata and helpers.
 */

export interface Discipline {
  key: string;
  label: string;
  description: string;
  icon: string;        // Ionicons name
  badgeClass: string;
  color: string;
}

export const DISCIPLINES: Discipline[] = [
  {
    key: 'quantum_physics',
    label: 'Quantum Physics',
    description:
      'Explore wave functions, entanglement, quantum gates, and statistical mechanics through computational examples.',
    icon: 'planet-outline',
    badgeClass: 'wp-badge-quantum',
    color: 'var(--wp-quantum)',
  },
  {
    key: 'biomechanical_engineering',
    label: 'Biomechanical Engineering',
    description:
      'Model human movement, tissue mechanics, prosthetics, and musculoskeletal systems with numerical methods.',
    icon: 'body-outline',
    badgeClass: 'wp-badge-biomech',
    color: 'var(--wp-biomech)',
  },
  {
    key: 'neuroscience',
    label: 'Neuroscience',
    description:
      'Simulate neural dynamics, spike trains, connectome analysis, and brain-computer interface signal processing.',
    icon: 'pulse-outline',
    badgeClass: 'wp-badge-neuro',
    color: 'var(--wp-neuro)',
  },
  {
    key: 'material_science',
    label: 'Material Science',
    description:
      'Compute crystal structures, phase diagrams, defect energetics, and mechanical properties from first principles.',
    icon: 'cube-outline',
    badgeClass: 'wp-badge-material',
    color: 'var(--wp-material)',
  },
  {
    key: 'biophysics',
    label: 'Biophysics',
    description:
      'Apply statistical physics to protein folding, membrane dynamics, molecular motors, and cellular mechanics.',
    icon: 'leaf-outline',
    badgeClass: 'wp-badge-biophysics',
    color: 'var(--wp-biophysics)',
  },
];

export const getDiscipline = (key: string): Discipline | undefined =>
  DISCIPLINES.find((d) => d.key === key);

export const getDisciplineLabel = (key: string): string =>
  getDiscipline(key)?.label ?? key.replace(/_/g, ' ');

export const getDisciplineBadgeClass = (key: string): string =>
  getDiscipline(key)?.badgeClass ?? 'wp-badge';

export const getDifficultyBadgeClass = (difficulty: string): string => {
  const map: Record<string, string> = {
    beginner: 'wp-badge-beginner',
    intermediate: 'wp-badge-intermediate',
    advanced: 'wp-badge-advanced',
  };
  return map[difficulty] ?? 'wp-badge';
};

/**
 * Build a VS Code deep-link URI that opens a temporary Python file.
 * The user must have the Python extension installed.
 */
export function buildVSCodeUri(code: string, title: string): string {
  const filename = encodeURIComponent(`${title.replace(/\s+/g, '_')}.py`);
  const encoded = encodeURIComponent(code);
  return `vscode://vscode.github-authentication/did-authenticate?${filename}&code=${encoded}`;
}

/**
 * Build a Google Colab URL that opens a new notebook pre-populated with code.
 * Uses the Colab "open from URL" feature with a data URI.
 */
export function buildColabUrl(code: string, title: string): string {
  const notebook = {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {
      kernelspec: { display_name: 'Python 3', language: 'python', name: 'python3' },
      language_info: { name: 'python', version: '3.11' },
    },
    cells: [
      {
        cell_type: 'markdown',
        metadata: {},
        source: [`# ${title}\n\n*World Pieces — Engineering & Physics Code Examples*`],
      },
      {
        cell_type: 'code',
        execution_count: null,
        metadata: {},
        outputs: [],
        source: [code],
      },
    ],
  };
  const json = JSON.stringify(notebook);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return `https://colab.research.google.com/notebook#create=true&data=${b64}`;
}
