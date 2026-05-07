export type Role = 'citizen' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  reputation: number;
  level: string;
  points: number;
  phone?: string;
  bio?: string;
  customEmail?: string;
  customRole?: string;
  customMemberSince?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  kycStatus?: 'not_submitted' | 'under_review' | 'verified' | 'rejected';
  legalName?: string;
  dob?: string;
  address?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'report_update' | 'achievement' | 'system';
  read: boolean;
  createdAt: any;
}

export interface ViolationReport {
  id: string;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  status: 'submitted' | 'under-review' | 'verified' | 'action-taken' | 'resolved';
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  image: string;
  coordinates?: { lat: number; lng: number };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
}
