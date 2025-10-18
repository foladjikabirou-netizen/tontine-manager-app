import { User, Group, Contribution, Payout, Adjustment } from '../types.ts';

export const initialUsers: User[] = [
  { id: 'u1', name: 'Admin Tontine', phone: '123-456-7890', email: 'admin@tontine.app', role: 'admin' },
  { id: 'u2', name: 'Alice Dupont', phone: '111-222-3333', email: 'alice@email.com', role: 'member' },
  { id: 'u3', name: 'Bob Martin', phone: '444-555-6666', email: 'bob@email.com', role: 'member' },
  { id: 'u4', name: 'Claire Dubois', phone: '777-888-9999', email: 'claire@email.com', role: 'member' },
  { id: 'u5', name: 'David Petit', phone: '101-112-1314', email: 'david@email.com', role: 'member' },
];

const tontineStartDate = new Date();
// Let's pretend the tontine started 4 weeks ago to have some history
tontineStartDate.setDate(tontineStartDate.getDate() - 4 * 7);

const getWeekDate = (start: Date, weekNumber: number) => {
    const date = new Date(start);
    date.setDate(date.getDate() + (weekNumber - 1) * 7);
    return date;
};

export const initialGroups: Group[] = [
  {
    id: 'g1',
    name: 'Tontine Famille',
    frequency: 'hebdomadaire',
    memberIds: ['u1', 'u2', 'u3', 'u4'],
    payoutOrder: ['u2', 'u3', 'u4', 'u1'], // Order for payouts
    startDate: tontineStartDate.toISOString(),
    durationWeeks: 12,
    memberContributions: {
        'u1': 14000,
        'u2': 14000,
        'u3': 21000,
        'u4': 28000,
    }
  },
  {
    id: 'g2',
    name: 'Amis du Quartier',
    frequency: 'hebdomadaire',
    memberIds: ['u2', 'u3', 'u5'],
    payoutOrder: ['u5', 'u2', 'u3'],
    startDate: tontineStartDate.toISOString(),
    durationWeeks: 12,
    memberContributions: {
        'u2': 10000,
        'u3': 10000,
        'u5': 15000,
    }
  },
];

export const initialContributions: Contribution[] = [
  // Contributions for "Tontine Famille" - Week 1
  { id: 'c1', groupId: 'g1', userId: 'u1', date: getWeekDate(tontineStartDate, 1).toISOString(), amount: 14000 },
  { id: 'c2', groupId: 'g1', userId: 'u2', date: getWeekDate(tontineStartDate, 1).toISOString(), amount: 14000 },
  { id: 'c3', groupId: 'g1', userId: 'u3', date: getWeekDate(tontineStartDate, 1).toISOString(), amount: 21000 },
  { id: 'c4', groupId: 'g1', userId: 'u4', date: getWeekDate(tontineStartDate, 1).toISOString(), amount: 28000 },
  
  // Contributions for "Tontine Famille" - Week 2
  { id: 'c5', groupId: 'g1', userId: 'u1', date: getWeekDate(tontineStartDate, 2).toISOString(), amount: 14000 },
  { id: 'c6', groupId: 'g1', userId: 'u2', date: getWeekDate(tontineStartDate, 2).toISOString(), amount: 14000 },
  // u3 missed week 2's payment
  { id: 'c8', groupId: 'g1', userId: 'u4', date: getWeekDate(tontineStartDate, 2).toISOString(), amount: 28000 },
];

export const initialPayouts: Payout[] = [
  // Payout for Week 1 recipient (u2)
  { id: 'p1', groupId: 'g1', userId: 'u2', date: getWeekDate(tontineStartDate, 1).toISOString(), amount: 77000 }, // 14k+14k+21k+28k
  // Payout for Week 2 recipient (u3)
  { id: 'p2', groupId: 'g1', userId: 'u3', date: getWeekDate(tontineStartDate, 2).toISOString(), amount: 56000 }, // Less because u3 missed payment (14k+14k+28k)
];

export const initialAdjustments: Adjustment[] = [];