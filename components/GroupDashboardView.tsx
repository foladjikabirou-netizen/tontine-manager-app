import React from 'react';
import { Group, User, Contribution, Payout, Adjustment } from '../types.ts';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow flex items-center">
        <div className={`p-3 rounded-full mr-4 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

interface GroupDashboardViewProps {
  group: Group;
  users: User[];
  contributions: Contribution[];
  payouts: Payout[];
  adjustments: Adjustment[];
  currentUser: User;
  onAddPaymentClick: () => void;
  onAddMemberClick: () => void;
  onModifyPotClick: () => void;
}

const GroupDashboardView: React.FC<GroupDashboardViewProps> = ({ group, users, contributions, payouts, adjustments, currentUser, onAddPaymentClick, onAddMemberClick, onModifyPotClick }) => {
    const findUser = (id: string) => users.find(u => u.id === id);

    const nextBeneficiaryId = group.payoutOrder[payouts.filter(p => p.groupId === group.id).length % group.payoutOrder.length];
    const nextBeneficiary = findUser(nextBeneficiaryId);

    const today = new Date();
    const startDate = new Date(group.startDate);
    const weeksPassed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const currentWeekStartDate = new Date(startDate);
    currentWeekStartDate.setDate(currentWeekStartDate.getDate() + weeksPassed * 7);

    const weekEndDate = new Date(currentWeekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 7);

    const currentPeriodContributions = contributions.filter(c => {
        const contributionDate = new Date(c.date);
        return c.groupId === group.id && contributionDate >= currentWeekStartDate && contributionDate < weekEndDate;
    });

    const currentPeriodAdjustments = adjustments.filter(a => {
        const adjustmentDate = new Date(a.date);
        return a.groupId === group.id && adjustmentDate >= currentWeekStartDate && adjustmentDate < weekEndDate;
    });

    const contributionsSum = currentPeriodContributions.reduce((sum, c) => sum + c.amount, 0);
    const adjustmentsSum = currentPeriodAdjustments.reduce((sum, a) => sum + a.amount, 0);
    const currentPot = contributionsSum + adjustmentsSum;


    return (
        <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title="Cagnotte de la Semaine 💰" value={`${currentPot} CFA`} color="bg-yellow-100 text-yellow-600" icon={
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25-2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 3a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 12m15-3a3 3 0 1 1-6 0m6 0a3 3 0 1 0-6 0" /></svg>
                }/>
                <StatCard title="Nombre de Membres 👥" value={group.memberIds.length} color="bg-indigo-100 text-indigo-600" icon={
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-2.278 1 1 0 0 0 0-1.414zM10.5 13.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm-7.5 0a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0z" /></svg>
                }/>
                <StatCard title="Tour en Cours 🔔" value={nextBeneficiary?.name || 'Indisponible'} color="bg-blue-100 text-blue-600" icon={
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-6.75c-.621 0-1.125.504-1.125 1.125V18.75m9 0h-9" /></svg>
                }/>
            </div>
            {/* Quick Actions and Payout History */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions Rapides</h3>
                    <div className="space-y-3">
                        <button 
                            onClick={onAddPaymentClick}
                            className="w-full text-left flex items-center px-4 py-3 bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100 transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                            Ajouter un paiement
                        </button>
                         <button 
                            onClick={onAddMemberClick}
                            className="w-full text-left flex items-center px-4 py-3 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962a3.75 3.75 0 0 1 5.25 0m-5.25 0a3.75 3.75 0 0 0-5.25 0M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                            Ajouter un membre
                        </button>
                        {currentUser.role === 'admin' && (
                             <button 
                                onClick={onModifyPotClick}
                                className="w-full text-left flex items-center px-4 py-3 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
                               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                               </svg>
                                Modifier la Cagnotte
                            </button>
                        )}
                    </div>
                </div>
                 <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold text-gray-800">Historique des Bénéficiaires</h2>
                    </div>
                    {payouts.filter(p => p.groupId === group.id).length > 0 ? (
                        <ul role="list" className="divide-y divide-gray-200">
                            {payouts.filter(p => p.groupId === group.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((payout, index) => {
                                const user = findUser(payout.userId);
                                return (
                                    <li key={payout.id} className="px-6 py-4 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                                <p className="text-sm text-gray-500">Reçu le: {new Date(payout.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-sm font-semibold text-green-600">
                                            + {payout.amount} CFA
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    ) : (
                         <p className="px-6 py-8 text-center text-gray-500">Aucun paiement n'a encore été effectué.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupDashboardView;