export interface DomainMeta {
  id: string;
  name: string;
  category: 'Software & Web' | 'Data & AI' | 'Cloud & Systems' | 'Hardware & IoT' | 'Mobile & Security';
  description: string;
  popularStacks: string[];
  accentColor: string;
}

export const DOMAIN_CATALOG: DomainMeta[] = [
  {
    id: 'web_development',
    name: 'Full-Stack Web Development',
    category: 'Software & Web',
    description: 'Modern reactive web apps, REST/GraphQL microservices, SSR architecture, and cloud data persistence.',
    popularStacks: ['React', 'Next.js', 'Node.js', 'TypeScript', 'Tailwind CSS'],
    accentColor: 'from-blue-500/10 to-indigo-500/10 border-blue-200 text-blue-700',
  },
  {
    id: 'ai_ml',
    name: 'Applied AI & Machine Learning',
    category: 'Data & AI',
    description: 'Predictive modeling, deep learning architectures, feature engineering, and model explainability (XAI).',
    popularStacks: ['Python', 'PyTorch', 'Scikit-Learn', 'FastAPI', 'Pandas'],
    accentColor: 'from-purple-500/10 to-pink-500/10 border-purple-200 text-purple-700',
  },
  {
    id: 'cloud_devops',
    name: 'Cloud Architecture & DevOps',
    category: 'Cloud & Systems',
    description: 'Container orchestration, CI/CD pipelines, Infrastructure as Code, serverless, and cloud observability.',
    popularStacks: ['AWS', 'Docker', 'Kubernetes', 'GitHub Actions', 'Terraform'],
    accentColor: 'from-cyan-500/10 to-blue-500/10 border-cyan-200 text-cyan-700',
  },
  {
    id: 'iot_embedded',
    name: 'IoT & Embedded Systems',
    category: 'Hardware & IoT',
    description: 'Microcontroller programming, sensor telemetry, edge computing, MQTT broker pipelines, and IoT security.',
    popularStacks: ['ESP32', 'C/C++', 'FreeRTOS', 'MQTT', 'InfluxDB'],
    accentColor: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 text-emerald-700',
  },
  {
    id: 'data_analytics',
    name: 'Data Engineering & Big Data',
    category: 'Data & AI',
    description: 'Distributed data pipelines, ETL workflows, data warehousing, stream processing, and analytics modeling.',
    popularStacks: ['Apache Spark', 'PostgreSQL', 'Python', 'Kafka', 'SQL'],
    accentColor: 'from-amber-500/10 to-orange-500/10 border-amber-200 text-amber-700',
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity & Defense',
    category: 'Mobile & Security',
    description: 'Network forensics, vulnerability assessment, cryptography protocols, identity management, and threat modeling.',
    popularStacks: ['Linux', 'Wireshark', 'Python', 'Snort', 'OWASP ZAP'],
    accentColor: 'from-rose-500/10 to-red-500/10 border-rose-200 text-rose-700',
  },
  {
    id: 'mobile_dev',
    name: 'Mobile App Development',
    category: 'Mobile & Security',
    description: 'Cross-platform native mobile engineering, state management, mobile offline caching, and responsive device UX.',
    popularStacks: ['Flutter', 'Dart', 'React Native', 'Firebase', 'SQLite'],
    accentColor: 'from-violet-500/10 to-indigo-500/10 border-violet-200 text-violet-700',
  },
];

const CANONICAL_DOMAIN_IDS = new Set(DOMAIN_CATALOG.map((domain) => domain.id));

const LEGACY_DOMAIN_ALIASES: Record<string, string> = {
  'full-stack web development': 'web_development',
  'web development': 'web_development',
  'applied artificial intelligence / machine learning': 'ai_ml',
  'applied ai & machine learning': 'ai_ml',
  'artificial intelligence': 'ai_ml',
  'artificial intelligence / machine learning': 'ai_ml',
  'machine learning': 'ai_ml',
  ai: 'ai_ml',
  'cloud architecture & devops': 'cloud_devops',
  'cloud computing & devops': 'cloud_devops',
  'cloud computing': 'cloud_devops',
  'internet of things (iot) & embedded firmware': 'iot_embedded',
  'iot & embedded systems': 'iot_embedded',
  'internet of things': 'iot_embedded',
  'data engineering & big data systems': 'data_analytics',
  'data engineering & big data': 'data_analytics',
  'data science': 'data_analytics',
  'data science & analytics': 'data_analytics',
  'cybersecurity & network defense': 'cybersecurity',
  'cybersecurity & defense': 'cybersecurity',
  'cyber security': 'cybersecurity',
  'mobile application development (flutter/react native)': 'mobile_dev',
  'mobile application development': 'mobile_dev',
  'mobile app development': 'mobile_dev',
};

export function canonicalizeDomainId(domain: string): string {
  const normalized = domain.trim().toLowerCase();
  if (CANONICAL_DOMAIN_IDS.has(normalized)) return normalized;
  return LEGACY_DOMAIN_ALIASES[normalized] ?? domain;
}

export function canonicalizeDomainIds(domains: string[]): string[] {
  return domains.map(canonicalizeDomainId);
}

// Standardized vocabulary aligned with model/preprocessing/features.py
export const CANONICAL_SKILLS_TAXONOMY: { name: string; category: string; aliases: string[] }[] = [
  // Languages
  { name: 'Python', category: 'Languages', aliases: ['py', 'python3'] },
  { name: 'JavaScript', category: 'Languages', aliases: ['js', 'es6'] },
  { name: 'TypeScript', category: 'Languages', aliases: ['ts'] },
  { name: 'C++', category: 'Languages', aliases: ['cpp', 'c/c++'] },
  { name: 'C Language', category: 'Languages', aliases: ['c', 'ansi-c'] },
  { name: 'Java', category: 'Languages', aliases: ['java8', 'core-java'] },
  { name: 'SQL', category: 'Languages', aliases: ['mysql', 'rdbms'] },
  { name: 'HTML & CSS', category: 'Languages', aliases: ['html5', 'css3', 'tailwind'] },
  { name: 'Dart', category: 'Languages', aliases: ['flutter'] },

  // Frameworks & Libraries
  { name: 'React.js', category: 'Frameworks', aliases: ['react', 'reactjs'] },
  { name: 'Next.js', category: 'Frameworks', aliases: ['next', 'nextjs', 'ssr'] },
  { name: 'Node.js', category: 'Frameworks', aliases: ['node', 'nodejs'] },
  { name: 'Express.js', category: 'Frameworks', aliases: ['express', 'expressjs'] },
  { name: 'FastAPI', category: 'Frameworks', aliases: ['fast-api', 'uvicorn'] },
  { name: 'PyTorch', category: 'Frameworks', aliases: ['torch', 'deep-learning'] },
  { name: 'TensorFlow', category: 'Frameworks', aliases: ['tf', 'keras'] },
  { name: 'Scikit-Learn', category: 'Frameworks', aliases: ['sklearn', 'scikit'] },
  { name: 'Flutter', category: 'Frameworks', aliases: ['flutter-sdk', 'dart'] },
  { name: 'Django', category: 'Frameworks', aliases: ['django-rest'] },
  { name: 'Flask', category: 'Frameworks', aliases: ['flask-api'] },

  // Databases
  { name: 'MongoDB', category: 'Databases', aliases: ['mongo', 'nosql', 'mongoose'] },
  { name: 'PostgreSQL', category: 'Databases', aliases: ['postgres', 'pg'] },
  { name: 'MySQL', category: 'Databases', aliases: ['mysql-server'] },
  { name: 'InfluxDB', category: 'Databases', aliases: ['influx', 'time-series'] },
  { name: 'Redis', category: 'Databases', aliases: ['cache', 'in-memory'] },

  // Cloud & DevOps
  { name: 'Docker', category: 'Cloud & DevOps', aliases: ['containers', 'docker-compose'] },
  { name: 'Kubernetes', category: 'Cloud & DevOps', aliases: ['k8s', 'orchestration'] },
  { name: 'AWS Cloud Services', category: 'Cloud & DevOps', aliases: ['aws', 'amazon-web-services', 'ec2', 's3'] },
  { name: 'Linux System Administration', category: 'Cloud & DevOps', aliases: ['linux', 'bash', 'shell'] },
  { name: 'Git & Version Control', category: 'Cloud & DevOps', aliases: ['git', 'github', 'vcs'] },

  // IoT & Embedded
  { name: 'ESP32 Microcontroller', category: 'IoT & Embedded', aliases: ['esp32', 'esp-idf', 'esp8266'] },
  { name: 'Arduino Platform', category: 'IoT & Embedded', aliases: ['arduino-ide', 'embedded-c'] },
  { name: 'MQTT Protocol', category: 'IoT & Embedded', aliases: ['mqtt', 'mosquitto', 'pubsub'] },
  { name: 'Raspberry Pi Single-Board', category: 'IoT & Embedded', aliases: ['rpi', 'raspi', 'iot-edge'] },
  { name: 'FreeRTOS Real-Time OS', category: 'IoT & Embedded', aliases: ['freertos', 'rtos'] },
];
