# Component Architecture & Reusability Plan

**Project:** AI-Based Tech-Stack Recommendation with ERP Integration (`SKIT/DS/2023-2027/CSE-F-096`)  
**Author:** Prachi Bhardwaj (Frontend Developer)  
**Sprint:** Sprint 1 — Dashboard Interface Planning & Design  
**Date:** September 2026  

---

## 1. Overview & Architectural Goals

This document specifies the modular component architecture for the Student Tech-Stack Recommendation Dashboard. All components are designed as standalone, reusable React components styled with Tailwind CSS, establishing a consistent design language and clear data boundaries.

> **Note on Data Payloads:** All prop contracts and data types defined below are **provisional assumptions** for Sprints 2 through 4. They are drafted to anticipate backend API shapes from the Node.js/Express gateway (developed by Lakshya Jain) and the FastAPI/AI services (developed by Nishant Kumawat).

---

## 2. Component Hierarchy & Taxonomy

```text
src/
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.tsx      # Main application shell with sidebar & header
│   │   ├── Sidebar.tsx              # Nav list, active states, collapse controls
│   │   └── Header.tsx               # Top banner, student summary pill, ERP sync status
│   ├── profile/
│   │   ├── StudentProfileCard.tsx   # ERP identity card (name, roll no, branch, CGPA)
│   │   └── SkillBadgeList.tsx       # Tag cloud for self-assessed and extracted skills
│   ├── recommendation/
│   │   ├── RecommendationCard.tsx   # Tech stack recommendation card with score badge
│   │   ├── TechStackBadge.tsx       # Domain-coded badge for languages, frameworks, DBs
│   │   └── StackFilterToolbar.tsx   # Filter by domain, difficulty, and sort criteria
│   ├── explanation/
│   │   ├── ExplanationPanel.tsx     # SHAP explainability card & feature weight bars
│   │   └── FactorImpactRow.tsx      # Single feature contribution row (+/- influence)
│   └── common/
│       ├── StatCard.tsx             # Key metric KPI card for dashboard overview
│       ├── EmptyState.tsx           # Informative empty-state container with action CTA
│       └── StatusPill.tsx           # Sync, status, and tag status pills
```

---

## 3. Core Component Specifications

### 3.1 Layout Components

#### 1. `DashboardLayout`
- **Responsibility:** Top-level application shell. Houses the sticky Sidebar, persistent Header, and flexible content area. Ensures consistent max-width, background colors, and responsive drawer toggling on mobile viewports.
- **Props Signature:**
  ```typescript
  interface DashboardLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onNavigate: (tabId: string) => void;
  }
  ```

#### 2. `Sidebar`
- **Responsibility:** Renders the navigation links (Overview, Profile & Input, Recommendations, Explanation), current active item highlight, and college branding ("SKIT IoT Lab").
- **Props Signature:**
  ```typescript
  interface NavItem {
    id: string;
    label: string;
    icon: string;
    badge?: string;
  }

  interface SidebarProps {
    items: NavItem[];
    activeId: string;
    onSelect: (id: string) => void;
  }
  ```

#### 3. `Header`
- **Responsibility:** Displays breadcrumb/page title, ERP integration status badge ("Synced with SKIT ERP"), and current student profile pill.
- **Props Signature:**
  ```typescript
  interface HeaderProps {
    title: string;
    subtitle?: string;
    erpConnected: boolean;
    lastSyncedAt?: string;
    studentName: string;
    rollNumber: string;
  }
  ```

---

### 3.2 Student Profile & Input Components (Sprint 2 Interface Previews)

#### 4. `StudentProfileCard`
- **Responsibility:** Displays the verified student record retrieved from the college ERP system, highlighting academic status and foundational parameters used by the AI model.
- **Provisional Data Shape (Sprint 2 Assumption):**
  ```typescript
  export interface StudentProfile {
    id: string;
    erpStudentId: string;
    name: string;
    email: string;
    branch: string;             // e.g. "CSE (IoT)"
    section: string;            // e.g. "A-G2"
    semester: number;           // e.g. 6
    cgpa: number;               // e.g. 8.42
    academicYear: string;       // e.g. "2023-2027"
    interests: string[];        // e.g. ["Internet of Things", "Full-Stack Development"]
    skills: Array<{
      name: string;
      level: 'Beginner' | 'Intermediate' | 'Advanced';
      source: 'ERP_COURSEWORK' | 'SELF_REPORTED' | 'RESUME_PARSED';
    }>;
    resumeUploaded: boolean;
    resumeFileName?: string;
  }

  interface StudentProfileCardProps {
    profile: StudentProfile;
    isEditable?: boolean;
    onEditClick?: () => void;
  }
  ```

#### 5. `SkillBadgeList`
- **Responsibility:** Interactive tag list showing student skills with color coding based on source (ERP verified vs. self-reported vs. resume parsed).
- **Props Signature:**
  ```typescript
  interface SkillItem {
    name: string;
    level?: string;
    source?: 'ERP_COURSEWORK' | 'SELF_REPORTED' | 'RESUME_PARSED';
  }

  interface SkillBadgeListProps {
    skills: SkillItem[];
    onRemove?: (skillName: string) => void;
    readOnly?: boolean;
  }
  ```

---

### 3.3 Recommendation Components (Sprint 3 Interface Previews)

#### 6. `RecommendationCard`
- **Responsibility:** Primary card showing a recommended technology stack. Features match confidence percentage, primary role target, categorized components (Frontend, Backend, Database, Cloud), and an action button to inspect SHAP explanation.
- **Provisional Data Shape (Sprint 3 Assumption):**
  ```typescript
  export interface TechItem {
    name: string;
    category: 'Frontend' | 'Backend' | 'Database' | 'DevOps' | 'AI_ML' | 'IoT';
    iconUrl?: string;
  }

  export interface RecommendationItem {
    id: string;
    title: string;                 // e.g. "Modern Cloud-Native Full Stack"
    category: string;              // e.g. "Web Development & Cloud"
    matchScore: number;            // e.g. 94 (0-100 percentage)
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    estimatedTimeToLearn: string;  // e.g. "10-12 Weeks"
    targetRoles: string[];         // e.g. ["Full Stack Developer", "Cloud Engineer"]
    technologies: TechItem[];
    whyRecommendedSnippet: string; // One sentence high-level summary
    rank: number;
  }

  interface RecommendationCardProps {
    recommendation: RecommendationItem;
    isFeatured?: boolean;
    onViewExplanation: (recommendationId: string) => void;
  }
  ```

#### 7. `TechStackBadge`
- **Responsibility:** Clean, pill-shaped badge representing an individual technology or framework with categorized styling (e.g., green for Node/Express, blue for React/TypeScript, amber for Python/AI).
- **Props Signature:**
  ```typescript
  interface TechStackBadgeProps {
    name: string;
    category?: 'Frontend' | 'Backend' | 'Database' | 'DevOps' | 'AI_ML' | 'IoT';
    size?: 'sm' | 'md' | 'lg';
  }
  ```

---

### 3.4 Explainability & SHAP Components (Sprint 4 Interface Previews)

#### 8. `ExplanationPanel`
- **Responsibility:** Renders the AI explainability card for a selected recommendation. Visualizes top driving factors (e.g. "High score in Database Management (ERP): +32% impact", "Python coursework: +24% impact", "Lack of Docker experience: -8% impact").
- **Provisional Data Shape (Sprint 4 Assumption — SHAP Weights):**
  ```typescript
  export interface FeatureImpact {
    featureName: string;
    displayName: string;
    shapValue: number;             // e.g. +0.34 or -0.12
    impactDirection: 'POSITIVE' | 'NEGATIVE';
    category: 'ERP_ACADEMICS' | 'STUDENT_INTEREST' | 'EXISTING_SKILL' | 'INDUSTRY_DEMAND';
    explanationNote: string;       // e.g. "Based on Grade A in CSE-304 (Web Tech)"
  }

  export interface StackExplanation {
    recommendationId: string;
    recommendationTitle: string;
    baseConfidence: number;        // e.g. 0.88
    summaryText: string;
    topPositiveFactors: FeatureImpact[];
    topNegativeFactors: FeatureImpact[];
    learningPrerequisites: string[];
  }

  interface ExplanationPanelProps {
    explanation: StackExplanation;
    onBackToRecommendations?: () => void;
  }
  ```

#### 9. `FactorImpactRow`
- **Responsibility:** Single bar/row item showing the feature name, source badge (ERP, Resume, Interest), impact direction indicator (+/–), and percentage contribution bar.
- **Props Signature:**
  ```typescript
  interface FactorImpactRowProps {
    factor: FeatureImpact;
    maxAbsValue?: number;
  }
  ```

---

### 3.5 Common & Utility Components

#### 10. `StatCard`
- **Responsibility:** Concise summary KPI card with title, large metric number, secondary helper text, and optional trend/status icon.
- **Props Signature:**
  ```typescript
  interface StatCardProps {
    title: string;
    value: string | number;
    helperText?: string;
    icon?: React.ReactNode;
    colorVariant?: 'blue' | 'emerald' | 'indigo' | 'amber' | 'slate';
  }
  ```

#### 11. `EmptyState`
- **Responsibility:** Generic placeholder view for uninitialized states (e.g., when no recommendations have been generated yet, or when viewing an empty filter result).
- **Props Signature:**
  ```typescript
  interface EmptyStateProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    actionLabel?: string;
    onAction?: () => void;
  }
  ```

---

## 4. Provisional Payload Summary Table

| Payload Entity | Consumed In | Expected Source | Key Fields |
|---|---|---|---|
| `StudentProfile` | Profile & Input, Header, Overview | Node.js Gateway + ERP API | `erpStudentId`, `branch`, `cgpa`, `skills[]`, `interests[]` |
| `RecommendationItem` | Overview, Recommendations List | FastAPI AI Service (Random Forest) | `id`, `title`, `matchScore`, `difficulty`, `technologies[]` |
| `StackExplanation` | Explanation View | FastAPI SHAP Service | `recommendationId`, `topPositiveFactors[]`, `topNegativeFactors[]` |
