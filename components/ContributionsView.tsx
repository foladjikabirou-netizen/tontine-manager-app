import React from 'react';
import { Group, User, Contribution } from '../types.ts';

interface ContributionsViewProps {
  group: Group;
  users: User[];
  contributions: Contribution[];
  onCellClick: (member: User, weekStartDate: Date) => void;
}

const ContributionsView: React.FC<ContributionsViewProps> = ({ group, users, contributions, onCellClick }) => {
    const groupMembers = users.filter(user => group.memberIds.includes(user.id));
    const periods = Array.from({ length: group.durationWeeks }, (_, i) => {
        const weekStartDate = new Date(group.startDate);
        weekStartDate.setDate(weekStartDate.getDate() + i * 7);
        return {
            name: `S. ${i + 1}`,
            date: weekStartDate,
        };
    });

    return (
         <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">Suivi détaillé des Cotisations</h2>
                <p className="text-sm text-gray-500 mt-1">Cliquez sur une case pour ajouter ou voir les paiements journaliers.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-48">Membre</th>
                            {periods.map(p => (
                                <th key={p.name} scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">{p.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {groupMembers.map(member => (
                            <tr key={member.id}>
                                <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10">
                                    <div className="text-sm font-medium text-gray-900 truncate">{member.name}</div>
                                    <div className="text-sm text-gray-500 truncate">{member.email}</div>
                                </td>
                                {periods.map(period => {
                                    const weekStartDate = period.date;
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
                                    });

                                    const totalPaidInWeek = contributionsInWeek.reduce((sum, c) => sum + c.amount, 0);
                                    const expectedAmount = group.memberContributions[member.id] || 0;
                                    
                                    let statusColor = 'text-gray-600';
                                    if (totalPaidInWeek > 0) {
                                        statusColor = totalPaidInWeek >= expectedAmount ? 'text-green-600' : 'text-yellow-600';
                                    }
                                    if (expectedAmount === 0 && totalPaidInWeek === 0) {
                                        statusColor = 'text-gray-400';
                                    }


                                    return (
                                        <td key={period.name} className="px-6 py-4 whitespace-nowrap text-center">
                                            <button 
                                                onClick={() => onCellClick(member, period.date)}
                                                className={`w-full h-full text-center p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 ${statusColor}`}
                                                aria-label={`Paiements de ${member.name} pour la semaine du ${period.date.toLocaleDateString()}`}
                                            >
                                                <div className="font-semibold text-sm">
                                                    {totalPaidInWeek.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    / {expectedAmount.toLocaleString()}
                                                </div>
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ContributionsView;