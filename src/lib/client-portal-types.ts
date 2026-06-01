/**
 * @fileOverview Type definitions for the Mwijay Services Client Portal.
 */

export type MilestoneStatus = 'pending' | 'in_progress' | 'completed';

export type ProjectStatus =
  | 'planning'
  | 'design'
  | 'development'
  | 'testing'
  | 'deployment'
  | 'completed'
  | 'on_hold';

export interface Milestone {
  id: string;
  name: string;
  status: MilestoneStatus;
  completedAt: any | null;
  notes: string;
  order: number;
}

export interface Deliverable {
  id: string;
  name: string;
  url: string;
  fileType: string;
  uploadedAt: any;
  size?: string;
}

export interface ClientProject {
  projectId: string;
  clientId: string;
  projectName: string;
  service: string;
  description: string;
  status: ProjectStatus;
  progressPercent: number;
  currentMilestone: string;
  milestones: Milestone[];
  totalAmount: number;
  amountPaid: number;
  startDate: any;
  estimatedCompletion: any | null;
  deliverables: Deliverable[];
  createdAt: any;
  updatedAt: any;
}

export interface ClientProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  projectId: string;
  createdAt: any;
  lastLogin?: any;
}

export interface ClientMessage {
  id?: string;
  projectId: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'client';
  message: string;
  timestamp: any;
  isRead: boolean;
}

export const DEFAULT_MILESTONES: Omit<Milestone, 'id'>[] = [
  {
    name: 'Project Kickoff',
    status: 'completed',
    completedAt: null,
    notes: 'Project accepted and initial setup initiated.',
    order: 1
  },
  {
    name: 'Requirements & Planning',
    status: 'in_progress',
    completedAt: null,
    notes: 'Defining technical roadmap and system logic.',
    order: 2
  },
  {
    name: 'Design & UI/UX',
    status: 'pending',
    completedAt: null,
    notes: '',
    order: 3
  },
  {
    name: 'Development Phase',
    status: 'pending',
    completedAt: null,
    notes: '',
    order: 4
  },
  {
    name: 'Testing & QA',
    status: 'pending',
    completedAt: null,
    notes: '',
    order: 5
  },
  {
    name: 'Deployment & Launch',
    status: 'pending',
    completedAt: null,
    notes: '',
    order: 6
  },
  {
    name: 'Handover & Support',
    status: 'pending',
    completedAt: null,
    notes: '',
    order: 7
  }
];
