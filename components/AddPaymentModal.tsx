import React, { useState, useEffect } from 'react';
import { Group, User, Contribution } from '../types.ts';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contribution: Contribution) => void;
  group: Group;
  users: User[];
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ isOpen, onClose, onSave, group, users }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<string>('0');
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    if (group && isOpen) {
        // Reset form on group change or modal open
        const firstMemberId = group.memberIds[0] || '';
        setSelectedUserId(firstMemberId);
        setSelectedWeek('0');
    }
  }, [group, isOpen]);

  useEffect(() => {
    if (selectedUserId && group) {
      setAmount(group.memberContributions[selectedUserId] || 0);
    }
  }, [selectedUserId, group]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedWeek) {
        alert("Veuillez sélectionner un membre et une semaine.");
        return;
    }
    const weekStartDate = new Date(group.startDate);
    weekStartDate.setDate(weekStartDate.getDate() + parseInt(selectedWeek, 10) * 7);

    const newContribution: Contribution = {
        id: `c_${Date.now()}_${selectedUserId}`,
        groupId: group.id,
        userId: selectedUserId,
        date: weekStartDate.toISOString(),
        amount: amount,
    };
    onSave(newContribution);
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
                <h2 className="text-xl font-bold text-gray-800">Enregistrer un Paiement</h2>
                <p className="text-sm text-gray-500 mt-1">Sélectionnez le membre et la semaine de la cotisation.</p>
            </div>
            <div className="p-6 space-y-4">
                 <div>
                    <label htmlFor="member" className="block text-sm font-medium text-gray-700 mb-1">Membre</label>
                    <select
                        id="member"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                        {groupMembers.map(member => (
                            <option key={member.id} value={member.id}>{member.name}</option>
                        ))}
                    </select>
                </div>
                 <div>
                    <label htmlFor="week" className="block text-sm font-medium text-gray-700 mb-1">Semaine</label>
                    <select
                        id="week"
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
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Montant (CFA)</label>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
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

export default AddPaymentModal;