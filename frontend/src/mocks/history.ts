import type { SavedRecommendationHistoryItem } from '../types';

export const mockRecommendationHistory: SavedRecommendationHistoryItem[] = [
  {
    id: 'rec_run_2026_09',
    runDate: '2026-09-26',
    semesterRecorded: 6,
    topStackTitle: 'Full-Stack Cloud Native (MERN + Docker)',
    matchScore: 94,
    technologiesSummary: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
    keyFactor: 'A+ in Web Lab (95%) & declared Cloud interest',
    targetRole: 'Cloud Solutions Associate & Full-Stack Developer',
  },
  {
    id: 'rec_run_2026_01',
    runDate: '2026-01-18',
    semesterRecorded: 5,
    topStackTitle: 'Backend & Distributed Database Engineering',
    matchScore: 89,
    technologiesSummary: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker'],
    keyFactor: 'DBMS Coursework Grade A (84%) & SQL Experience',
    targetRole: 'Backend Systems Engineer',
  },
  {
    id: 'rec_run_2025_08',
    runDate: '2025-08-10',
    semesterRecorded: 4,
    topStackTitle: 'IoT Firmware & Edge Cloud Analytics',
    matchScore: 85,
    technologiesSummary: ['C++', 'Python', 'MQTT', 'ESP32 / Raspberry Pi', 'Node-RED'],
    keyFactor: 'IoT Sensors Lab Grade A+ (92%) & CSE IoT Department Core',
    targetRole: 'Embedded Systems & IoT Engineer',
  },
];
