import React, { useState, useEffect, useMemo } from 'react';
import { Group, User, Contribution, Payout, Adjustment } from '../types.ts';

interface RecordPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payout: Payout) => void;
  group: Group;
  users: User[];
  contributions: Contribution[];
  adjustments: Adjustment[];
}

const RecordPayoutModal: React.FC<RecordPayoutModalProps> = ({ isOpen, onClose, onSave, group, users, contributions, adjustments }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<string>('0');

  useEffect(() => {
    if (group && isOpen) {
        // Default to the first member in payout order
        setSelectedUserId(group.payoutOrder[0] || '');
        setSelectedWeek('0');
    }
  }, [group, isOpen]);
  
  const potAmountForSelectedWeek = useMemo(() => {
    if (!group) return 0;
    
    const weekIndex = parseInt(selectedWeek, 10);
    const weekStartDate = new Date(group.startDate);
    weekStartDate.setDate(weekStartDate.getDate() + weekIndex * 7);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 7);

    const contributionsSum = contributions
        .filter(c => {
            const contributionDate = new Date(c.date);
            return (
                c.groupId === group.id &&
                contributionDate >= weekStartDate &&
                contributionDate < weekEndDate
            );
        })
        .reduce((sum, c) => sum + c.amount, 0);

    const adjustmentsSum = adjustments
        .filter(a => {
            const adjustmentDate = new Date(a.date);
            return (
                a.groupId === group.id &&
                adjustmentDate >= weekStartDate &&
                adjustmentDate < weekEndDate
            );
        })
        .reduce((sum, a) => sum + a.amount, 0);

    return contributionsSum + adjustmentsSum;

  }, [selectedWeek, group, contributions, adjustments]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedWeek) {
        alert("Veuillez sélectionner un membre et une semaine.");
        return;
    }
    const weekStartDate = new Date(group.startDate);
    weekStartDate.setDate(weekStartDate.getDate() + parseInt(selectedWeek, 10) * 7);

    const newPayout: Payout = {
        id: `p_${Date.now()}_${selectedUserId}`,
        groupId: group.id,
        userId: selectedUserId,
        date: weekStartDate.toISOString(),
        amount: potAmountForSelectedWeek,
    };
    onSave(newPayout);
  };

  if (!isOpen) return null;

  const groupMembers = users.filter(user => group.memberIds.includes(user.id));
  const weeks = Array.from({ length: group.durationWeeks }, (_, i) => {
    const weekStartDate = new Date(group.startDate);
    weekStartDate.setDate(weekStartDate.getDate() + i * 7);
    return {
        value: i.toString(),
        label: `Semaine ${i + 1} (${weekStartDate.toLocaleDateString()})`
    };
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
            <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">Enregistrer un Paiement de Tour</h2>
                <p className="text-sm text-gray-500 mt-1">Sélectionnez le membre bénéficiaire et la semaine correspondante.</p>
            </div>
            <div className="p-6 space-y-4">
                 <div>
                    <label htmlFor="payout-member" className="block text-sm font-medium text-gray-700 mb-1">Bénéficiaire</label>
                    <select
                        id="payout-member"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                        {group.payoutOrder.map(userId => {
                           const member = groupMembers.find(m => m.id === userId);
                           return member ? <option key={member.id} value={member.id}>{member.name}</option> : null;
                        })}
                    </select>
                </div>
                 <div>
                    <label htmlFor="payout-week" className="block text-sm font-medium text-gray-700 mb-1">Semaine du paiement</label>
                    <select
                        id="payout-week"
                        value={selectedWeek}
                        onChange={(e) => setSelectedWeek(e.target.value)}
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                        {weeks.map(week => (
                            <option key={week.value} value={week.value}>{week.label}</option>
                        ))}
                    </select>
                </div>
                 <div>
                    <label htmlFor="payout-amount" className="block text-sm font-medium text-gray-700 mb-1">Montant de la Cagnotte (CFA)</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                            type="number"
                            id="payout-amount"
                            value={potAmountForSelectedWeek}
                            readOnly
                            className="block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-500"
                        />
                    </div>
                     <p className="mt-2 text-xs text-gray-500">
                        Le montant est calculé automatiquement à partir des cotisations et ajustements enregistrés pour la semaine sélectionnée.
                    </p>
                </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                 <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    Annuler
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    Enregistrer le paiement
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default RecordPayoutModal;