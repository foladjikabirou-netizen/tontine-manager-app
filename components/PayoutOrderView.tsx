import React from 'react';
import { Group, User, Payout } from '../types.ts';

interface PayoutOrderViewProps {
  group: Group;
  users: User[];
  payouts: Payout[];
  onRecordPayoutClick: () => void;
}

const PayoutOrderView: React.FC<PayoutOrderViewProps> = ({ group, users, payouts, onRecordPayoutClick }) => {
    const findUser = (id: string) => users.find(u => u.id === id);
    const paidUserIds = new Set(payouts.filter(p => p.groupId === group.id).map(p => p.userId));
    const nextBeneficiaryIndex = payouts.filter(p => p.groupId === group.id).length;

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Ordre des Bénéficiaires</h2>
                    <p className="text-sm text-gray-500 mt-1">Voici l'ordre de réception des cagnottes pour ce groupe.</p>
                </div>
                <button
                    onClick={onRecordPayoutClick}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    Enregistrer un Paiement de Tour
                </button>
            </div>
            <ul role="list" className="divide-y divide-gray-200">
                {group.payoutOrder.map((userId, index) => {
                    const user = findUser(userId);
                    const hasBeenPaid = paidUserIds.has(userId);
                    const isNext = index === nextBeneficiaryIndex;

                    let statusBadge;
                    if (hasBeenPaid) {
                        statusBadge = <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Reçu</span>;
                    } else if (isNext) {
                        statusBadge = <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">En cours</span>;
                    } else {
                         statusBadge = <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">À venir</span>;
                    }

                    return (
                        <li key={userId} className={`px-6 py-4 flex items-center justify-between ${isNext ? 'bg-blue-50' : ''}`}>
                            <div className="flex items-center">
                                <span className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                                    hasBeenPaid ? 'bg-green-100 text-green-700' : isNext ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'
                                }`}>{index + 1}</span>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                    <p className="text-sm text-gray-500">{user?.email}</p>
                                </div>
                            </div>
                            {statusBadge}
                        </li>
                    )
                })}
            </ul>
        </div>
    );
};

export default PayoutOrderView;