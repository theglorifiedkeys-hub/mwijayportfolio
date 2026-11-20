import { Timestamp } from 'firebase/firestore';

/**
 * @fileOverview Utilities for order management, inquiry generation, and currency formatting.
 */

export function generateOrderId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `MWJ-${year}-${random}`;
}

export function generateInquiryId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `IDZ-${year}-${random}`;
}

export function formatTZS(amount: number): string {
  return `TZS ${amount.toLocaleString('en-TZ')}`;
}

export type OrderStatus = 
  | 'pending_payment'
  | 'payment_confirmed' 
  | 'delivered'
  | 'cancelled';

export interface Order {
  id?: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productId: string;
  productName: string;
  productImage: string;
  amount: number;
  currency: 'TZS';
  status: OrderStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  verifiedAt: Timestamp | null;
  deliveredAt: Timestamp | null;
  adminNotes: string;
  paymentMethod: 'mobile_money';
}

export type InquiryStatus =
  | 'new'
  | 'reviewing'
  | 'quoted'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface ProjectInquiry {
  id?: string;
  inquiryId: string;
  service: string;
  projectName: string;
  description: string;
  timeline: 'urgent' | 'standard' | 'flexible';
  budgetRange: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCompany: string;
  agreedToTerms: boolean;
  typedSignature: string;
  status: InquiryStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  adminNotes: string;
}
