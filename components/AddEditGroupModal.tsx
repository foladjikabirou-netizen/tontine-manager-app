import React, { useState, useEffect } from 'react';
import { Group, User } from '../types.ts';

interface AddEditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (groupData: Omit<Group, 'id' | 'payoutOrder'> & { id?: string }) => void;
  mode: 'add' | 'edit';
  initialData: Group | null;
  allUsers: User[];
}

const AddEditGroupModal: React.FC<AddEditGroupModalProps> = ({ isOpen, onClose, onSave, mode, initialData, allUsers }) => {
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<'hebdomadaire' | 'mensuelle'>('hebdomadaire');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [durationWeeks, setDurationWeeks] = useState(12);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [memberAmounts, setMemberAmounts] = useState<{ [userId: string]: number }>({});

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setName(initialData.name);
        setFrequency(initialData.frequency);
        setStartDate(new Date(initialData.startDate).toISOString().split('T')[0]);
        setDurationWeeks(initialData.durationWeeks);
        setSelectedMemberIds(initialData.memberIds);
        setMemberAmounts(initialData.memberContributions);
      } else {
        // Reset for 'add' mode
        setName('');
        setFrequency('hebdomadaire');
        setStartDate(new Date().toISOString().split('T')[0]);
        setDurationWeeks(12);
        setSelectedMemberIds([]);
        setMemberAmounts({});
      }
    }
  }, [isOpen, mode, initialData]);

  const handleMemberSelection = (userId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedMemberIds(prev => [...prev, userId]);
      // Set a default amount when selecting a member for the first time
      if (memberAmounts[userId] === undefined) {
         setMemberAmounts(prev => ({ ...prev, [userId]: 10000 }));
      }
    } else {
      setSelectedMemberIds(prev => prev.filter(id => id !== userId));
      // Optionally remove amount when deselecting, or keep it
      // const newAmounts = { ...memberAmounts };
      // delete newAmounts[userId];
      // setMemberAmounts(newAmounts);
    }
  };

  const handleAmountChange = (userId: string, amount: number) => {
    setMemberAmounts(prev => ({ ...prev, [userId]: amount }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || selectedMemberIds.length === 0) {
      alert("Le nom du groupe et au moins un membre sont requis.");
      return;
    }
    
    for (const memberId of selectedMemberIds) {
      if (memberAmounts[memberId] === undefined || memberAmounts[memberId] <= 0) {
        alert(`Veuillez définir un montant de cotisation valide pour tous les membres sélectionnés.`);
        return;
      }
    }

    const groupData = {
      name,
      frequency,
      startDate: new Date(startDate).toISOString(),
      durationWeeks: Number(durationWeeks),
      memberIds: selectedMemberIds,
      memberContributions: memberAmounts,
    };
    
    onSave(mode === 'edit' && initialData ? { ...groupData, id: initialData.id } : groupData);
  };

  if (!isOpen) return null;
  
  const availableUsers = allUsers.filter(u => u.role === 'member');
  const selectedMembers = allUsers.filter(u => selectedMemberIds.includes(u.id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">{mode === 'add' ? 'Créer un nouveau groupe' : 'Modifier le groupe'}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {mode === 'add' ? 'Remplissez les détails pour créer votre groupe.' : 'Mettez à jour les informations du groupe.'}
            </p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto flex-1">
            {/* Left Column: Group Details */}
            <div className="space-y-4">
               <div>
                <label htmlFor="group-name" className="block text-sm font-medium text-gray-700 mb-1">Nom du groupe</label>
                <input type="text" id="group-name" value={name} onChange={(e) => setName(e.target.value)} required className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
              </div>
               <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">Fréquence</label>
                <select id="frequency" value={frequency} onChange={(e) => setFrequency(e.target.value as 'hebdomadaire' | 'mensuelle')} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                  <option value="hebdomadaire">Hebdomadaire</option>
                  <option value="mensuelle">Mensuelle</option>
                </select>
              </div>
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                <input type="date" id="start-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">Durée (en semaines)</label>
                <input type="number" id="duration" value={durationWeeks} onChange={(e) => setDurationWeeks(Number(e.target.value))} required className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
              </div>
            </div>

            {/* Right Column: Members and Amounts */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Membres et Cotisations</label>
              <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-2 bg-gray-50">
                {availableUsers.length > 0 ? availableUsers.map(user => (
                  <div key={user.id} className="p-2 rounded-md hover:bg-gray-100 flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                          id={`member-${user.id}`}
                          type="checkbox"
                          checked={selectedMemberIds.includes(user.id)}
                          onChange={(e) => handleMemberSelection(user.id, e.target.checked)}
                          className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <label htmlFor={`member-${user.id}`} className="ml-3 text-sm text-gray-700">{user.name}</label>
                    </div>
                    {selectedMemberIds.includes(user.id) && (
                        <div className="relative">
                            <input
                                type="number"
                                value={memberAmounts[user.id] || ''}
                                onChange={(e) => handleAmountChange(user.id, Number(e.target.value))}
                                className="w-28 text-right pr-8 pl-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                                placeholder="Montant"
                                required
                            />
                            <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-sm text-gray-500">CFA</span>
                        </div>
                    )}
                  </div>
                )) : <p className="text-center text-sm text-gray-500 p-4">Aucun membre disponible à ajouter.</p>}
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              Annuler
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              {mode === 'add' ? 'Créer le groupe' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditGroupModal;