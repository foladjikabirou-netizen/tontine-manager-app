import React, { useState, useEffect, useMemo } from 'react';
import { Group, Contribution, Adjustment } from '../types';

interface ModifyPotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (adjustment: Adjustment) => void;
  group: Group;
  contributions: Contribution[];
  adjustments: Adjustment[];
}

const ModifyPotModal: React.FC<ModifyPotModalProps> = ({ isOpen, onClose, onSave, group, contributions, adjustments }) => {
  const [newTotalAmount, setNewTotalAmount] = useState<number>(0);
  const [reason, setReason] = useState<string>('');

  const { currentWeekStartDate, currentPot } = useMemo(() => {
    if (!group) return { currentWeekStartDate: new Date(), currentPot: 0 };
    
    const today = new Date();
    const startDate = new Date(group.startDate);
    const weeksPassed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const currentWeekStartDate = new Date(startDate);
    currentWeekStartDate.setDate(currentWeekStartDate.getDate() + weeksPassed * 7);
    const weekEndDate = new Date(currentWeekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 7);

    const contributionsSum = contributions
        .filter(c => {
            const contributionDate = new Date(c.date);
            return c.groupId === group.id && contributionDate >= currentWeekStartDate && contributionDate < weekEndDate;
        })
        .reduce((sum, c) => sum + c.amount, 0);

    const adjustmentsSum = adjustments
        .filter(a => {
            const adjustmentDate = new Date(a.date);
            return a.groupId === group.id && adjustmentDate >= currentWeekStartDate && adjustmentDate < weekEndDate;
        })
        .reduce((sum, a) => sum + a.amount, 0);

    return { currentWeekStartDate, currentPot: contributionsSum + adjustmentsSum };

  }, [group, contributions, adjustments]);

  useEffect(() => {
    if (isOpen) {
        setNewTotalAmount(currentPot);
        setReason('');
    }
  }, [isOpen, currentPot]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim() === '') {
        alert("Veuillez fournir une raison pour la modification.");
        return;
    }

    const adjustmentAmount = newTotalAmount - currentPot;

    const newAdjustment: Adjustment = {
        id: `adj_${Date.now()}`,
        groupId: group.id,
        date: currentWeekStartDate.toISOString(),
        amount: adjustmentAmount,
        reason: reason,
    };

    onSave(newAdjustment);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
            <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">Modifier la Cagnotte de la Semaine</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Semaine du {currentWeekStartDate.toLocaleDateString()}
                </p>
            </div>
            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Montant Actuel (CFA)</label>
                    <input
                        type="number"
                        value={currentPot}
                        readOnly
                        className="block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none text-gray-500"
                    />
                </div>
                 <div>
                    <label htmlFor="new-total-amount" className="block text-sm font-medium text-gray-700 mb-1">Nouveau Montant Total (CFA)</label>
                    <input
                        type="number"
                        id="new-total-amount"
                        value={newTotalAmount}
                        onChange={(e) => setNewTotalAmount(Number(e.target.value))}
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        required
                    />
                </div>
                 <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Raison de la modification</label>
                    <input
                        type="text"
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Ex: Arrondi, Don, Correction..."
                        required
                    />
                </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                 <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    Annuler
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    Enregistrer la modification
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ModifyPotModal;