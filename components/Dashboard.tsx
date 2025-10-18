import React, { useState, useMemo } from 'react';
import { User, Group, Contribution, Payout, Adjustment } from '../types.ts';
import GroupDashboardView from './GroupDashboardView.tsx';
import MembersView from './MembersView.tsx';
import ContributionsView from './ContributionsView.tsx';
import PayoutOrderView from './PayoutOrderView.tsx';
import AddPaymentModal from './AddPaymentModal.tsx';
import AddMemberModal from './AddMemberModal.tsx';
import RecordPayoutModal from './RecordPayoutModal.tsx';
import ModifyPotModal from './ModifyPotModal.tsx';
import AddEditGroupModal from './AddEditGroupModal.tsx';
import DailyPaymentModal from './DailyPaymentModal.tsx'; // Import new modal

interface DashboardProps {
  currentUser: User;
  onLogout: () => void;
  users: User[];
  groups: Group[];
  contributions: Contribution[];
  payouts: Payout[];
  adjustments: Adjustment[];
  onDataUpdate: (
    newUsers: User[],
    newGroups: Group[],
    newContributions: Contribution[],
    newPayouts: Payout[],
    newAdjustments: Adjustment[]
    ) => void;
}

type ActiveView = 'dashboard' | 'members' | 'contributions' | 'payout_order';
type DailyPaymentModalData = { member: User; weekStartDate: Date; };


const Header: React.FC<{ currentUser: User; onLogout: () => void }> = ({ currentUser, onLogout }) => (
  <header className="bg-white shadow-md sticky top-0 z-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center">
          <svg className="h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
          <span className="ml-3 text-2xl font-bold text-gray-800">Tontine Manager</span>
        </div>
        <div className="flex items-center">
          <div className="text-right mr-4">
            <p className="font-semibold text-gray-700">{currentUser.name}</p>
            <p className="text-sm text-gray-500">{currentUser.role}</p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            aria-label="Se déconnecter"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>
);

const ViewSwitcher: React.FC<{ activeView: ActiveView, setActiveView: (view: ActiveView) => void }> = ({ activeView, setActiveView }) => {
    const tabs: {id: ActiveView, name: string}[] = [
        { id: 'dashboard', name: 'Tableau de bord' },
        { id: 'members', name: 'Membres' },
        { id: 'contributions', name: 'Cotisations' },
        { id: 'payout_order', name: 'Ordre des Tours' },
    ];
    return (
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveView(tab.id)}
                        className={`${
                            activeView === tab.id
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        {tab.name}
                    </button>
                ))}
            </nav>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = (props) => {
  const { currentUser, onLogout, users, groups, contributions, payouts, adjustments, onDataUpdate } = props;
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(groups[0]?.id || null);
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isRecordPayoutModalOpen, setIsRecordPayoutModalOpen] = useState(false);
  const [isModifyPotModalOpen, setIsModifyPotModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupModalMode, setGroupModalMode] = useState<'add' | 'edit'>('add');
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<User | null>(null);
  
  const [isDailyPaymentModalOpen, setIsDailyPaymentModalOpen] = useState(false);
  const [dailyPaymentModalData, setDailyPaymentModalData] = useState<DailyPaymentModalData | null>(null);


  const selectedGroup = useMemo(() => {
    return groups.find(g => g.id === selectedGroupId) || null;
  }, [groups, selectedGroupId]);

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setActiveView('dashboard'); // Reset to dashboard view on group change
  };
  
  const handleOpenAddGroupModal = () => {
    setEditingGroup(null);
    setGroupModalMode('add');
    setIsGroupModalOpen(true);
  };

  const handleOpenEditGroupModal = (group: Group) => {
    setEditingGroup(group);
    setGroupModalMode('edit');
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = (groupData: Omit<Group, 'id' | 'payoutOrder'> & { id?: string }) => {
    let updatedGroups;
    if (groupModalMode === 'add') {
        const newGroup: Group = {
            ...groupData,
            id: `g${Date.now()}`,
            payoutOrder: groupData.memberIds, // Set initial payout order to member selection order
        };
        updatedGroups = [...groups, newGroup];
    } else {
        const existingGroup = groups.find(g => g.id === editingGroup?.id);
        if (!existingGroup) return;

        const updatedPayoutOrder = [
            ...existingGroup.payoutOrder.filter(id => groupData.memberIds.includes(id)),
            ...groupData.memberIds.filter(id => !existingGroup.payoutOrder.includes(id)),
        ];

        updatedGroups = groups.map(g =>
            g.id === editingGroup?.id
                ? { ...g, ...groupData, id: g.id, payoutOrder: updatedPayoutOrder }
                : g
        );
    }
    onDataUpdate(users, updatedGroups, contributions, payouts, adjustments);
    setIsGroupModalOpen(false);
  };
  
  const handleDeleteGroup = () => {
    if (!groupToDelete) return;

    const updatedGroups = groups.filter(g => g.id !== groupToDelete.id);
    const updatedContributions = contributions.filter(c => c.groupId !== groupToDelete.id);
    const updatedPayouts = payouts.filter(p => p.groupId !== groupToDelete.id);
    const updatedAdjustments = adjustments.filter(a => a.groupId !== groupToDelete.id);
    
    onDataUpdate(users, updatedGroups, updatedContributions, updatedPayouts, updatedAdjustments);
    
    if (selectedGroupId === groupToDelete.id) {
        setSelectedGroupId(updatedGroups[0]?.id || null);
    }

    setGroupToDelete(null); // Close confirmation modal
  };

  const handleDeleteMember = () => {
    if (!memberToDelete || !selectedGroup) return;

    const updatedGroups = groups.map(g => {
        if (g.id === selectedGroup.id) {
            const newMemberContributions = { ...g.memberContributions };
            delete newMemberContributions[memberToDelete.id];
            
            return {
                ...g,
                memberIds: g.memberIds.filter(id => id !== memberToDelete.id),
                payoutOrder: g.payoutOrder.filter(id => id !== memberToDelete.id),
                memberContributions: newMemberContributions,
            };
        }
        return g;
    });

    onDataUpdate(users, updatedGroups, contributions, payouts, adjustments);
    setMemberToDelete(null); // Close modal
  };
  
  const handleOpenDailyPaymentModal = (member: User, weekStartDate: Date) => {
    setDailyPaymentModalData({ member, weekStartDate });
    setIsDailyPaymentModalOpen(true);
  };

  // Generic function to add any new contribution (full or partial)
  const handleAddPayment = (newContribution: Contribution) => {
    const updatedContributions = [...contributions, newContribution];
    onDataUpdate(users, groups, updatedContributions, payouts, adjustments);
    // This function will be called by both modals, so we close both
    setIsPaymentModalOpen(false);
    setIsDailyPaymentModalOpen(false); // Close daily modal if it was open
  };
  
  const handleDeleteContribution = (contributionId: string) => {
    const updatedContributions = contributions.filter(c => c.id !== contributionId);
    onDataUpdate(users, groups, updatedContributions, payouts, adjustments);
  };
  
  const handleAddMember = (newMemberData: { name: string; email: string; phone: string }) => {
    if (!selectedGroup) return;

    const newUserId = `u${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      role: 'member',
      ...newMemberData,
    };
    
    const updatedUsers = [...users, newUser];
    
    const updatedGroups = groups.map(g => {
        if (g.id === selectedGroup.id) {
            const updatedMemberIds = [...g.memberIds, newUser.id];
            const updatedPayoutOrder = [...g.payoutOrder, newUser.id];
            // Assign a default contribution amount for the new member, can be changed in edit mode
            const updatedMemberContributions = { ...g.memberContributions, [newUser.id]: 10000 };
            return { ...g, memberIds: updatedMemberIds, payoutOrder: updatedPayoutOrder, memberContributions: updatedMemberContributions };
        }
        return g;
    });

    onDataUpdate(updatedUsers, updatedGroups, contributions, payouts, adjustments);
    setIsAddMemberModalOpen(false);
  };

  const handleRecordPayout = (newPayout: Payout) => {
    const alreadyPaid = payouts.some(p => p.userId === newPayout.userId && p.groupId === newPayout.groupId);
    if (alreadyPaid) {
        alert("Ce membre a déjà reçu son paiement pour ce groupe.");
        return;
    }
    const updatedPayouts = [...payouts, newPayout];
    onDataUpdate(users, groups, contributions, updatedPayouts, adjustments);
    setIsRecordPayoutModalOpen(false);
  };

  const handleModifyPot = (newAdjustment: Adjustment) => {
    const updatedAdjustments = [...adjustments, newAdjustment];
    onDataUpdate(users, groups, contributions, payouts, updatedAdjustments);
    setIsModifyPotModalOpen(false);
  };


  const renderContent = () => {
      if (!selectedGroup) return null;
      switch(activeView) {
          case 'dashboard':
              return <GroupDashboardView group={selectedGroup} users={users} contributions={contributions} payouts={payouts} adjustments={adjustments} onAddPaymentClick={() => setIsPaymentModalOpen(true)} onAddMemberClick={() => setIsAddMemberModalOpen(true)} onModifyPotClick={() => setIsModifyPotModalOpen(true)} currentUser={currentUser}/>;
          case 'members':
              return <MembersView group={selectedGroup} users={users} contributions={contributions} onAddMemberClick={() => setIsAddMemberModalOpen(true)} currentUser={currentUser} onDeleteMemberClick={(member) => setMemberToDelete(member)} />;
          case 'contributions':
              return <ContributionsView group={selectedGroup} users={users} contributions={contributions} onCellClick={handleOpenDailyPaymentModal} />;
          case 'payout_order':
              return <PayoutOrderView group={selectedGroup} users={users} payouts={payouts} onRecordPayoutClick={() => setIsRecordPayoutModalOpen(true)} />;
          default:
              return null;
      }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentUser={currentUser} onLogout={onLogout} />
      <div className="flex">
        <nav className="w-64 bg-white p-5 border-r border-gray-200 h-[calc(100vh-64px)] sticky top-16 flex flex-col">
            <div>
              <h3 className="text-xs font-semibold uppercase text-gray-500 mb-4">Groupes de Tontine</h3>
              <ul>
                {groups.map(group => (
                  <li key={group.id} className="group relative rounded-md">
                    <button
                      onClick={() => handleSelectGroup(group.id)}
                      className={`w-full text-left pr-12 px-4 py-2 my-1 rounded-md text-sm font-medium transition-colors duration-150 ${
                        selectedGroupId === group.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {group.name}
                    </button>
                    {currentUser.role === 'admin' && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
                            <button onClick={() => handleOpenEditGroupModal(group)} className="p-1 text-gray-400 hover:text-primary-600 rounded-full hover:bg-gray-200" aria-label={`Modifier le groupe ${group.name}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                            </button>
                             <button onClick={() => setGroupToDelete(group)} className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-200" aria-label={`Supprimer le groupe ${group.name}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            {currentUser.role === 'admin' && (
                <div className="mt-auto pt-4 border-t border-gray-200">
                    <button onClick={handleOpenAddGroupModal} className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Créer un groupe
                    </button>
                </div>
            )}
        </nav>
        <main className="flex-1 p-6 lg:p-8">
          {selectedGroup ? (
            <>
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">{selectedGroup.name}</h1>
                    <p className="text-lg text-gray-600 mt-1">
                        Bienvenue sur le tableau de bord de votre groupe.
                    </p>
                </div>
                <ViewSwitcher activeView={activeView} setActiveView={setActiveView} />
                <div className="mt-8">
                    {renderContent()}
                </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun groupe sélectionné</h3>
                    <p className="mt-1 text-sm text-gray-500">Veuillez sélectionner un groupe ou en créer un nouveau pour commencer.</p>
                     {currentUser.role === 'admin' && (
                        <div className="mt-6">
                            <button onClick={handleOpenAddGroupModal} type="button" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                Créer un nouveau groupe
                            </button>
                        </div>
                    )}
                </div>
            </div>
          )}
        </main>
      </div>

       <AddEditGroupModal
          isOpen={isGroupModalOpen}
          onClose={() => setIsGroupModalOpen(false)}
          onSave={handleSaveGroup}
          mode={groupModalMode}
          initialData={editingGroup}
          allUsers={users}
      />
       {groupToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                     <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title-group-delete">
                      Supprimer le groupe
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Êtes-vous sûr de vouloir supprimer le groupe "{groupToDelete.name}" ? Toutes les données associées (cotisations, paiements) seront également supprimées. Cette action est irréversible.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button onClick={handleDeleteGroup} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
                  Supprimer
                </button>
                <button onClick={() => setGroupToDelete(null)} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
        
        {memberToDelete && selectedGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                     <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title-member-delete">
                      Retirer le membre
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Êtes-vous sûr de vouloir retirer "{memberToDelete.name}" du groupe "{selectedGroup.name}" ?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button onClick={handleDeleteMember} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
                  Retirer
                </button>
                <button onClick={() => setMemberToDelete(null)} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
        
        {dailyPaymentModalData && selectedGroup && (
             <DailyPaymentModal
                isOpen={isDailyPaymentModalOpen}
                onClose={() => setIsDailyPaymentModalOpen(false)}
                onSave={handleAddPayment}
                onDelete={handleDeleteContribution}
                group={selectedGroup}
                member={dailyPaymentModalData.member}
                weekStartDate={dailyPaymentModalData.weekStartDate}
                contributions={contributions}
            />
        )}


        {/* Other Modals */}
        {selectedGroup && (
            <>
                <AddPaymentModal 
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onSave={handleAddPayment}
                    group={selectedGroup}
                    users={users}
                />
                <AddMemberModal
                    isOpen={isAddMemberModalOpen}
                    onClose={() => setIsAddMemberModalOpen(false)}
                    onSave={handleAddMember}
                />
                <RecordPayoutModal
                    isOpen={isRecordPayoutModalOpen}
                    onClose={() => setIsRecordPayoutModalOpen(false)}
                    onSave={handleRecordPayout}
                    group={selectedGroup}
                    users={users}
                    contributions={contributions}
                    adjustments={adjustments}
                />
                <ModifyPotModal
                    isOpen={isModifyPotModalOpen}
                    onClose={() => setIsModifyPotModalOpen(false)}
                    onSave={handleModifyPot}
                    group={selectedGroup}
                    contributions={contributions}
                    adjustments={adjustments}
                />
            </>
        )}

    </div>
  );
};

export default Dashboard;