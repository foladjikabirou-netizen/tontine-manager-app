export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'admin' | 'member';
}

export interface Group {
  id: string;
  name: string;
  frequency: 'hebdomadaire' | 'mensuelle';
  memberIds: string[];
  payoutOrder: string[]; // array of user IDs
  startDate: string; // ISO string date
  durationWeeks: number;
  memberContributions: { [userId: string]: number }; // userId -> amount
}

export interface Contribution {
  id: string;
  groupId: string;
  userId: string;
  date: string; // ISO string date
  amount: number;
}

export interface Payout {
  id: string;
  groupId: string;
  userId: string;
  date: string; // ISO string date
  amount: number;
}

export interface Adjustment {
  id: string;
  groupId: string;
  date: string; // ISO string date, marks start of the week for adjustment
  amount: number; // positive or negative
  reason: string;
}