import React from 'react';
import { Group, User, Contribution } from '../types';

interface MembersViewProps {
  group: Group;
  users: User[];
  contributions: Contribution[];
  onAddMemberClick: () => void;
  currentUser: User;
  onDeleteMemberClick: (member: User) => void;
}

const MembersView: React.FC<MembersViewProps> = ({ group, users, contributions, onAddMemberClick, currentUser, onDeleteMemberClick }) => {
    const groupMembers = users.filter(user => group.memberIds.includes(user.id));
    
    const today = new Date();
    const startDate = new Date(group.startDate);
    const weeksPassed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const currentWeekStartDate = new Date(startDate);
    currentWeekStartDate.setDate(currentWeekStartDate.getDate() + weeksPassed * 7);

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {groupMembers.map(member => {
                    const weekEndDate = new Date(currentWeekStartDate);
                    weekEndDate.setDate(weekEndDate.getDate() + 7);

                    const contributionsInWeek = contributions.filter(c => {
                        const contributionDate = new Date(c.date);
                        return (
                            c.userId === member.id &&
                            c.groupId === group.id &&
                            contributionDate >= currentWeekStartDate &&
                            contributionDate < weekEndDate
                        );
                    });

                    const totalPaidInWeek = contributionsInWeek.reduce((sum, c) => sum + c.amount, 0);
                    const expectedAmount = group.memberContributions[member.id] || 0;
                    const hasPaid = totalPaidInWeek >= expectedAmount;

                    return (
                        <div key={member.id} className="bg-white rounded-lg shadow p-5 text-center relative group">
                            {currentUser.role === 'admin' && (
                                <button 
                                    onClick={() => onDeleteMemberClick(member)}
                                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    aria-label={`Supprimer ${member.name}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                            <div className="mb-3">
                                <span className="inline-block h-16 w-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold mx-auto">
                                    {member.name.charAt(0)}
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                            <p className="text-sm text-gray-500 mb-4">{member.email}</p>
                            {hasPaid ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    <svg className="-ml-1 mr-1.5 h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                    Payé
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                    <svg className="-ml-1 mr-1.5 h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 102 0V6zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path></svg>
                                    En attente
                                </span>
                            )}
                        </div>
                    );
                })}
                 <div onClick={onAddMemberClick} className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-center p-5 hover:border-primary-500 hover:text-primary-600 transition-colors cursor-pointer">
                    <div>
                        <svg className="mx-auto h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        <span className="mt-2 block text-sm font-medium">Ajouter un membre</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MembersView;