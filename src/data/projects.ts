export type Project = {
  id: string;
  title: string;
  category: string;
  year: string;
  stack: string[];
  description: string;
  detail: string;
  code: string;
};

export const projects: Project[] = [
  {
    id: '01',
    title: 'HOLLOW RELIC',
    category: 'CHARACTER STUDY',
    year: '2026',
    stack: ['BLENDER', 'ZBRUSH', 'SUBSTANCE'],
    description: 'A field-worn guardian built from hard planes and quiet detail.',
    detail:
      'An original low-poly character study focused on readable silhouette, layered armor, and a restrained material pass. The final asset is prepared for a real-time turntable and close-up inspection.',
    code: 'CHR-001',
  },
  {
    id: '02',
    title: 'DUSTWALKER',
    category: 'ENVIRONMENT KIT',
    year: '2026',
    stack: ['BLENDER', 'UNREAL ENGINE'],
    description: 'A compact exploration zone assembled from modular desert ruins.',
    detail:
      'A modular environment kit exploring scale, navigation, and silhouette under a limited material budget. The scene is organized around a clear route through a ruined relay station.',
    code: 'ENV-014',
  },
  {
    id: '03',
    title: 'NIGHT SHIFT',
    category: 'PROP SERIES',
    year: '2025',
    stack: ['BLENDER', 'MARMOSET TOOLBAG'],
    description: 'A small set of utilitarian props for an after-hours workshop.',
    detail:
      'A prop set built to practice clean topology, strong value grouping, and consistent texel density. Each object is designed to work as a hero asset or as part of a larger scene.',
    code: 'PRP-008',
  },
  {
    id: '04',
    title: 'ECHO PROTOCOL',
    category: 'GAME CONCEPT',
    year: '2025',
    stack: ['UNITY', 'BLENDER', 'FIGMA'],
    description: 'A stealth-game prototype about sound, space, and limited vision.',
    detail:
      'A small gameplay concept pairing a simple level blockout with a sound-driven navigation loop. The prototype investigates how minimal visual information can still support deliberate player choices.',
    code: 'GME-003',
  },
];
