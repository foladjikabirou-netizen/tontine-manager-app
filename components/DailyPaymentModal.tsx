import React, { useState, useMemo } from 'react';
import { Group, User, Contribution } from '../types.ts';

interface DailyPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contribution: Contribution) => void;
  onDelete: (contributionId: string) => void;
  group: Group;
  member: User;
  weekStartDate: Date;
  contributions: Contribution[];
}

const DailyPaymentModal: React.FC<DailyPaymentModalProps> = ({ isOpen, onClose, onSave, onDelete, group, member, weekStartDate, contributions }) => {
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const { weekEndDate, contributionsInWeek, totalPaidInWeek, expectedAmount } = useMemo(() => {
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 7);
    
    const contributionsInWeek = contributions.filter(c => {
        const contributionDate = new Date(c.date);
        return (
            c.userId === member.id &&
            c.groupId === group.id &&
            contributionDate >= weekStartDate &&
            contributionDate < weekEndDate
        );
    }).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const totalPaidInWeek = contributionsInWeek.reduce((sum, c) => sum + c.amount, 0);
    const expectedAmount = group.memberContributions[member.id] || 0;

    return { weekEndDate, contributionsInWeek, totalPaidInWeek, expectedAmount };
  }, [weekStartDate, contributions, member.id, group.id, group.memberContributions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof amount !== 'number' || amount <= 0) {
        alert("Veuillez entrer un montant valide.");
        return;
    }

    const newContribution: Contribution = {
        id: `c_${Date.now()}_${member.id}`,
        groupId: group.id,
        userId: member.id,
        date: new Date(paymentDate).toISOString(),
        amount: amount,
    };
    onSave(newContribution);
    setAmount(''); // Reset amount after saving
  };
  
  const remainingAmount = expectedAmount - totalPaidInWeek;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">Paiements pour {member.name}</h2>
            <p className="text-sm text-gray-500 mt-1">
                Semaine du {weekStartDate.toLocaleDateString()} au {new Date(weekEndDate.getTime() - 86400000).toLocaleDateString()}
            </p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Add Payment Form */}
            <div>
                 <h3 className="text-lg font-medium text-gray-900 mb-4">Ajouter un paiement</h3>
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="payment-date" className="block text-sm font-medium text-gray-700 mb-1">Date du paiement</label>
                        <input
                            type="date"
                            id="payment-date"
                            value={paymentDate}
                            onChange={e => setPaymentDate(e.target.value)}
                            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="payment-amount" className="block text-sm font-medium text-gray-700 mb-1">Montant (CFA)</label>
                        <input
                            type="number"
                            id="payment-amount"
                            value={amount}
                            onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Ex: 2000"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                           Ajouter
                        </button>
                    </div>
                 </form>
                 <div className="mt-6 border-t pt-4">
                    <div className="flex justify-between text-sm font-medium text-gray-600">
                        <span>Total Attendus:</span>
                        <span>{expectedAmount.toLocaleString()} CFA</span>
                    </div>
                     <div className="flex justify-between text-sm font-medium text-gray-600 mt-1">
                        <span>Total Versé:</span>
                        <span className="font-bold text-green-600">{totalPaidInWeek.toLocaleString()} CFA</span>
                    </div>
                     <div className="flex justify-between text-sm font-medium text-gray-600 mt-1">
                        <span>Restant:</span>
                        <span className={`font-bold ${remainingAmount > 0 ? 'text-red-600' : 'text-gray-800'}`}>{remainingAmount.toLocaleString()} CFA</span>
                    </div>
                 </div>
            </div>
            {/* Right: Payment History */}
            <div className="bg-gray-50 p-4 rounded-md">
                 <h3 className="text-lg font-medium text-gray-900 mb-4">Historique de la semaine</h3>
                 <div className="max-h-64 overflow-y-auto space-y-2">
                    {contributionsInWeek.length > 0 ? (
                        contributionsInWeek.map(c => (
                            <div key={c.id} className="bg-white p-2 rounded-md shadow-sm flex justify-between items-center text-sm">
                                <div>
                                    <span className="font-medium text-gray-800">{c.amount.toLocaleString()} CFA</span>
                                    <span className="text-gray-500 ml-2">({new Date(c.date).toLocaleDateString()})</span>
                                </div>
                                <button onClick={() => onDelete(c.id)} className="p-1 text-gray-400 hover:text-red-600 rounded-full" aria-label="Supprimer ce paiement">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-sm text-gray-500 py-4">Aucun paiement enregistré pour cette semaine.</p>
                    )}
                 </div>
            </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                Fermer
            </button>
        </div>
      </div>
    </div>
  );
};

export default DailyPaymentModal;