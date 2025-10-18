import React, { useState, useEffect, useMemo } from 'react';
import { User, Group, Contribution, Payout, Adjustment } from './types.ts';
import { initialUsers, initialGroups, initialContributions, initialPayouts, initialAdjustments } from './services/mockData.ts';
import Login from './components/Login.tsx';
import Dashboard from './components/Dashboard.tsx';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);

  useEffect(() => {
    // Attempt to load data from localStorage
    const storedAuth = localStorage.getItem('tontine_auth');
    const storedUser = localStorage.getItem('tontine_currentUser');
    const storedUsers = localStorage.getItem('tontine_users');
    const storedGroups = localStorage.getItem('tontine_groups');
    const storedContributions = localStorage.getItem('tontine_contributions');
    const storedPayouts = localStorage.getItem('tontine_payouts');
    const storedAdjustments = localStorage.getItem('tontine_adjustments');


    if (storedAuth && storedUser && storedUsers && storedGroups && storedContributions && storedPayouts && storedAdjustments) {
      setIsAuthenticated(JSON.parse(storedAuth));
      setCurrentUser(JSON.parse(storedUser));
      setUsers(JSON.parse(storedUsers));
      setGroups(JSON.parse(storedGroups));
      setContributions(JSON.parse(storedContributions));
      setPayouts(JSON.parse(storedPayouts));
      setAdjustments(JSON.parse(storedAdjustments));
    } else {
      // Initialize with mock data if localStorage is empty
      setUsers(initialUsers);
      setGroups(initialGroups);
      setContributions(initialContributions);
      setPayouts(initialPayouts);
      setAdjustments(initialAdjustments);
    }
  }, []);
  
  const saveDataToLocalStorage = (
    auth: boolean,
    user: User | null,
    usersData: User[],
    groupsData: Group[],
    contributionsData: Contribution[],
    payoutsData: Payout[],
    adjustmentsData: Adjustment[]
  ) => {
    localStorage.setItem('tontine_auth', JSON.stringify(auth));
    localStorage.setItem('tontine_currentUser', JSON.stringify(user));
    localStorage.setItem('tontine_users', JSON.stringify(usersData));
    localStorage.setItem('tontine_groups', JSON.stringify(groupsData));
    localStorage.setItem('tontine_contributions', JSON.stringify(contributionsData));
    localStorage.setItem('tontine_payouts', JSON.stringify(payoutsData));
    localStorage.setItem('tontine_adjustments', JSON.stringify(adjustmentsData));
  };


  const handleLogin = (email: string) => {
    const user = users.find(u => u.email === email);
    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user);
      saveDataToLocalStorage(true, user, users, groups, contributions, payouts, adjustments);
    } else {
      alert("Utilisateur non trouvé !");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    saveDataToLocalStorage(false, null, users, groups, contributions, payouts, adjustments);
  };
  
  const handleDataUpdate = (
    newUsers: User[],
    newGroups: Group[],
    newContributions: Contribution[],
    newPayouts: Payout[],
    newAdjustments: Adjustment[]
    ) => {
        setUsers(newUsers);
        setGroups(newGroups);
        setContributions(newContributions);
        setPayouts(newPayouts);
        setAdjustments(newAdjustments);
        saveDataToLocalStorage(isAuthenticated, currentUser, newUsers, newGroups, newContributions, newPayouts, newAdjustments);
    }

  const userOptions = useMemo(() => users.map(u => ({ value: u.id, label: u.name })), [users]);

  if (!isAuthenticated || !currentUser) {
    return <Login onLogin={handleLogin} userOptions={userOptions}/>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Dashboard
        currentUser={currentUser}
        onLogout={handleLogout}
        users={users}
        groups={groups}
        contributions={contributions}
        payouts={payouts}
        adjustments={adjustments}
        onDataUpdate={handleDataUpdate}
      />
    </div>
  );
};

export default App;