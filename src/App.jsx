import React, { useState, useEffect } from 'react';
import {
  Users, Gift, Plus, Home, ArrowRight, Sparkles, AlertCircle, X, LogOut, Info, Copy, CheckCircle
} from 'lucide-react';

// API client
const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3000/api';

const api = {
  async login(displayName, recoveryCode = null) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ displayName, recoveryCode })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Login failed');
    }
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  },

  async updateProfile(data) {
    const res = await fetch(`${API_BASE}/users/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Update failed');
    return res.json();
  },

  async getUser(userId) {
    const res = await fetch(`${API_BASE}/users/${userId}`, { credentials: 'include' });
    if (!res.ok) throw new Error('User not found');
    return res.json();
  },

  async getGroups() {
    const res = await fetch(`${API_BASE}/groups`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch groups');
    return res.json();
  },

  async getGroup(groupId) {
    const res = await fetch(`${API_BASE}/groups/${groupId}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Group not found');
    return res.json();
  },

  async createGroup(name) {
    const res = await fetch(`${API_BASE}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error('Failed to create group');
    return res.json();
  },

  async joinGroup(groupId) {
    const res = await fetch(`${API_BASE}/groups/${groupId}/join`, {
      method: 'POST',
      credentials: 'include'
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to join group');
    }
    return res.json();
  },

  async updateExclusions(groupId, exclusions) {
    const res = await fetch(`${API_BASE}/groups/${groupId}/exclusions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ exclusions })
    });
    if (!res.ok) throw new Error('Failed to update exclusions');
    return res.json();
  },

  async startDraw(groupId) {
    const res = await fetch(`${API_BASE}/groups/${groupId}/draw`, {
      method: 'POST',
      credentials: 'include'
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to start draw');
    }
    return res.json();
  },

  async updateParticipantName(groupId, name) {
    const res = await fetch(`${API_BASE}/groups/${groupId}/participants/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error('Failed to update name');
    return res.json();
  },

  async getAdminData(password) {
    const res = await fetch(`${API_BASE}/admin/data`, {
      headers: { 'x-admin-password': password }
    });
    if (!res.ok) throw new Error('Invalid password or server error');
    return res.json();
  },

  async adminDeleteGroup(password, groupId) {
    const res = await fetch(`${API_BASE}/admin/groups/${groupId}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': password }
    });
    if (!res.ok) throw new Error('Failed to delete group');
    return res.json();
  },

  async adminUpdateGroupResults(password, groupId, results) {
    const res = await fetch(`${API_BASE}/admin/groups/${groupId}/results`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ results })
    });
    if (!res.ok) throw new Error('Failed to update results');
    return res.json();
  },

  async adminUpdateUser(password, userId, data) {
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
  },

  async adminCreateGroup(password, name, budget) {
    const res = await fetch(`${API_BASE}/admin/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ name, budget })
    });
    if (!res.ok) throw new Error('Failed to create group');
    return res.json();
  },

  async adminAddParticipant(password, groupId, name) {
    const res = await fetch(`${API_BASE}/admin/groups/${groupId}/participants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error('Failed to add participant');
    return res.json();
  },

  async adminStartDraw(password, groupId) {
    const res = await fetch(`${API_BASE}/admin/groups/${groupId}/draw`, {
      method: 'POST',
      headers: { 'x-admin-password': password }
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to start draw');
    }
    return res.json();
  },

  async adminUpdateExclusions(password, groupId, exclusions) {
    const res = await fetch(`${API_BASE}/admin/groups/${groupId}/exclusions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ exclusions })
    });
    if (!res.ok) throw new Error('Failed to update exclusions');
    return res.json();
  },

  async adminResetGroup(password, groupId) {
    const res = await fetch(`${API_BASE}/admin/groups/${groupId}/reset`, {
      method: 'POST',
      headers: { 'x-admin-password': password }
    });
    if (!res.ok) throw new Error('Failed to reset group');
    return res.json();
  },

  async adminUpdateGroup(password, groupId, data) {
    const res = await fetch(`${API_BASE}/admin/groups/${groupId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update group');
    return res.json();
  },

  async adminGetConfig(password) {
    const res = await fetch(`${API_BASE}/admin/config`, {
      headers: { 'x-admin-password': password }
    });
    if (!res.ok) throw new Error('Failed to get config');
    return res.json();
  },

  async adminUpdateConfig(password, data) {
    const res = await fetch(`${API_BASE}/admin/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update config');
    return res.json();
  }
};

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, icon: Icon }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      flex items-center justify-center gap-2 font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
      ${variant === 'primary' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30' : ''}
      ${variant === 'secondary' ? 'bg-slate-700 hover:bg-slate-600 text-white shadow-md' : ''}
      ${variant === 'outline' ? 'border-2 border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white' : ''}
      ${variant === 'danger' ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/50' : ''}
      py-3 px-6 ${className}
    `}
  >
    {Icon && <Icon size={20} />}
    {children}
  </button>
);

const Input = ({ value, onChange, placeholder, label, type = "text" }) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && <label className="text-sm font-medium text-slate-400 ml-1">{label}</label>}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="input-field"
    />
  </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-800 w-full max-w-md rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-700 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6 sticky top-0 bg-slate-800 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 sm:py-0 border-b border-slate-700 sm:border-0">
          <h3 className="text-lg sm:text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition-colors flex-shrink-0">
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// --- Snow Component ---
const Snow = () => {
  useEffect(() => {
    const container = document.getElementById('snow-container');
    if (!container) return;

    const createSnowflake = () => {
      const snowflake = document.createElement('div');
      snowflake.classList.add('snowflake');
      snowflake.innerHTML = '❄';
      snowflake.style.left = Math.random() * 100 + 'vw';
      snowflake.style.animationDuration = Math.random() * 3 + 2 + 's';
      snowflake.style.opacity = Math.random();
      snowflake.style.fontSize = Math.random() * 10 + 10 + 'px';

      container.appendChild(snowflake);

      setTimeout(() => {
        snowflake.remove();
      }, 5000);
    };

    const interval = setInterval(createSnowflake, 100);
    return () => clearInterval(interval);
  }, []);

  return <div id="snow-container" className="fixed inset-0 pointer-events-none z-0" />;
};

// --- Utils ---
const copyToClipboard = async (text, label = "Text") => {
  try {
    await navigator.clipboard.writeText(text);
    alert(`${label} copied!`);
  } catch (err) {
    // Fallback
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      alert(`${label} copied!`);
    } catch (err2) {
      prompt(`Could not copy automatically. Here is the ${label}:`, text);
    }
    document.body.removeChild(textArea);
  }
};

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('LOGIN'); // LOGIN, GROUP_LIST, GROUP_DETAIL
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Modals
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setJoinModalOpen] = useState(false);
  const [isExclusionModalOpen, setExclusionModalOpen] = useState(false);
  const [isRecoveryCodeModalOpen, setRecoveryCodeModalOpen] = useState(false);


  // Form States
  const [loginName, setLoginName] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [wishlistInput, setWishlistInput] = useState('');
  const [dislikesInput, setDislikesInput] = useState('');
  const [displayNameInput, setDisplayNameInput] = useState('');

  const [userRecoveryCode, setUserRecoveryCode] = useState(null);
  const [recipientData, setRecipientData] = useState(null);

  // Admin State
  const [adminPassword, setAdminPassword] = useState('');
  const [adminData, setAdminData] = useState(null);
  const [adminExclusionGroup, setAdminExclusionGroup] = useState(null);
  const [frontTitle, setFrontTitle] = useState("Macnamara's Secret Santa!");
  const [expandedGroups, setExpandedGroups] = useState({});

  // Fetch front page title on mount (no auth required)
  useEffect(() => {
    const fetchTitle = async () => {
      try {
        const res = await fetch(`${API_BASE}/config`);
        if (res.ok) {
          const config = await res.json();
          setFrontTitle(config.title || "Macnamara's Secret Santa!");
        }
      } catch (err) {
        console.log('Could not fetch title, using default');
      }
    };
    fetchTitle();
  }, []);

  // Check authentication and route on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loginCode = params.get('login');

    if (window.location.pathname === '/admin') {
      setView('ADMIN_LOGIN');
      setLoading(false);
    } else if (loginCode) {
      // Magic Link Login
      api.login(null, loginCode)
        .then(async userData => {
          setUser(userData);
          setDisplayNameInput(userData.displayName);
          setWishlistInput(userData.wishlist || '');
          setDislikesInput(userData.dislikes || '');

          try {
            const userGroups = await api.getGroups();
            setGroups(userGroups);
            if (userGroups.length > 0) {
              setActiveGroupId(userGroups[0].id);
              setView('GROUP_DETAIL');
            } else {
              setView('GROUP_LIST');
            }
          } catch (e) {
            console.error('Failed to auto-fetch groups:', e);
            setView('GROUP_LIST');
          }

          // Clear URL without reloading
          window.history.replaceState({}, document.title, '/');
        })
        .catch(err => {
          console.error('Magic login failed:', err);
          setView('LOGIN');
        })
        .finally(() => setLoading(false));
    } else {
      checkAuth();
    }
  }, []);

  // Fetch groups when user is authenticated
  useEffect(() => {
    if (user && view === 'GROUP_LIST') {
      fetchGroups();
    }
  }, [user, view]);

  // Fetch active group details
  useEffect(() => {
    if (activeGroupId && user) {
      fetchGroup(activeGroupId);
    }
  }, [activeGroupId, user]);

  // Poll for updates when viewing a group
  useEffect(() => {
    if (activeGroupId && view === 'GROUP_DETAIL') {
      const interval = setInterval(() => {
        fetchGroup(activeGroupId);
      }, 2000); // Poll every 2 seconds
      return () => clearInterval(interval);
    }
  }, [activeGroupId, view]);

  // Fetch recipient data when group is drawn
  useEffect(() => {
    if (activeGroup?.status === 'DRAWN' && user) {
      const recipientId = activeGroup.results?.[user.userId];
      if (recipientId) {
        api.getUser(recipientId).then(data => {
          setRecipientData(data);
        }).catch(err => {
          console.error('Failed to fetch recipient data:', err);
        });
      }
    } else {
      setRecipientData(null);
    }
  }, [activeGroup, user]);

  async function checkAuth() {
    try {
      const userData = await api.getMe();
      setUser(userData);
      setDisplayNameInput(userData.displayName);
      setWishlistInput(userData.wishlist || '');
      setDislikesInput(userData.dislikes || '');

      const userGroups = await api.getGroups();
      setGroups(userGroups);

      if (userGroups.length > 0) {
        setActiveGroupId(userGroups[0].id);
        setView('GROUP_DETAIL');
      } else {
        setView('GROUP_LIST');
      }
    } catch (err) {
      setView('LOGIN');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    if (!loginName.trim()) return;

    try {
      setError(null);
      const userData = await api.login(loginName, null);
      setUser(userData);
      setDisplayNameInput(userData.displayName);
      setWishlistInput(userData.wishlist || '');
      setDislikesInput(userData.dislikes || '');

      // Show recovery code modal for new users
      if (userData.isNewUser && userData.recoveryCode) {
        setUserRecoveryCode(userData.recoveryCode);
        setRecoveryCodeModalOpen(true);
      }

      const userGroups = await api.getGroups();
      setGroups(userGroups);

      if (userGroups.length > 0) {
        setActiveGroupId(userGroups[0].id);
        setView('GROUP_DETAIL');
      } else {
        setView('GROUP_LIST');
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAdminLogin() {
    try {
      setError(null);
      const data = await api.getAdminData(adminPassword);
      setAdminData(data);

      // Initialize expanded groups
      const initialExpanded = Object.keys(data.groups).reduce((acc, id) => ({ ...acc, [id]: true }), {});
      setExpandedGroups(initialExpanded);

      // Fetch config for front page title
      const config = await api.adminGetConfig(adminPassword);
      setFrontTitle(config.title || "Macnamara's Secret Santa!");

      setView('ADMIN_DASHBOARD');
    } catch (err) {
      setError(err.message);
    }
  }

  async function fetchGroups() {
    try {
      const groupsData = await api.getGroups();
      setGroups(groupsData);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    }
  }

  async function fetchGroup(groupId) {
    try {
      const groupData = await api.getGroup(groupId);
      setActiveGroup(groupData);
    } catch (err) {
      console.error('Failed to fetch group:', err);
    }
  }

  async function handleCreateGroup() {
    if (!newGroupName.trim()) return;
    try {
      setError(null);
      const group = await api.createGroup(newGroupName);
      setCreateModalOpen(false);
      setNewGroupName('');
      setActiveGroupId(group.id);
      setView('GROUP_DETAIL');
      await fetchGroups();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleJoinGroup() {
    if (!joinCodeInput.trim()) return;
    try {
      setError(null);
      const group = await api.joinGroup(joinCodeInput);
      setJoinModalOpen(false);
      setJoinCodeInput('');
      setActiveGroupId(group.id);
      setView('GROUP_DETAIL');
      await fetchGroups();
    } catch (err) {
      setError(err.message);
      alert(err.message);
    }
  }

  async function handleLogout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      setView('LOGIN');
      setGroups([]);
      setActiveGroup(null);
      setActiveGroupId(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }

  async function updateProfile() {
    try {
      setError(null);
      setSuccessMessage(null);
      await api.updateProfile({
        displayName: displayNameInput,
        wishlist: wishlistInput,
        dislikes: dislikesInput
      });

      // Also update name in current group if active
      if (activeGroup) {
        await api.updateParticipantName(activeGroup.id, displayNameInput);
        await fetchGroup(activeGroup.id);
      }

      setUser({ ...user, displayName: displayNameInput, wishlist: wishlistInput, dislikes: dislikesInput });
      setSuccessMessage('Profile saved successfully! ✓');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleStartDraw() {
    if (!activeGroup || activeGroup.participants.length < 3) {
      alert("Need at least 3 participants to draw.");
      return;
    }

    try {
      setError(null);
      await api.startDraw(activeGroup.id);
      await fetchGroup(activeGroup.id);
      // Stay on group detail, it will update to show results
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleExclusionUpdate(userId, excludeId) {
    if (!activeGroup) return;

    const currentExclusions = { ...activeGroup.exclusions };
    const userExclusions = currentExclusions[userId] || [];

    if (userExclusions.includes(excludeId)) {
      currentExclusions[userId] = userExclusions.filter(id => id !== excludeId);
    } else {
      currentExclusions[userId] = [...userExclusions, excludeId];
    }

    try {
      await api.updateExclusions(activeGroup.id, currentExclusions);
      await fetchGroup(activeGroup.id);
    } catch (err) {
      setError(err.message);
    }
  }



  async function handleAdminExclusionUpdate(groupId, userId, excludeId) {
    if (!adminData || !adminData.groups) return;
    const group = adminData.groups[groupId];
    if (!group) return;

    const currentExclusions = { ...group.exclusions };
    const userExclusions = currentExclusions[userId] || [];
    const excludeUserExclusions = currentExclusions[excludeId] || [];

    // Toggle exclusion (bidirectional)
    if (userExclusions.includes(excludeId)) {
      // Remove exclusion both ways
      currentExclusions[userId] = userExclusions.filter(id => id !== excludeId);
      currentExclusions[excludeId] = excludeUserExclusions.filter(id => id !== userId);
    } else {
      // Add exclusion both ways
      currentExclusions[userId] = [...userExclusions, excludeId];
      currentExclusions[excludeId] = [...excludeUserExclusions, userId];
    }

    try {
      await api.adminUpdateExclusions(adminPassword, groupId, currentExclusions);

      // Update adminData state
      if (adminData) {
        const newData = { ...adminData };
        if (newData.groups && newData.groups[groupId]) {
          newData.groups[groupId].exclusions = currentExclusions;
          setAdminData(newData);
        }
      }

      // Update adminExclusionGroup state if it's the currently open group
      if (adminExclusionGroup && adminExclusionGroup.id === groupId) {
        setAdminExclusionGroup(prev => ({
          ...prev,
          exclusions: currentExclusions
        }));
      }

      // Also update main groups state if needed
      await fetchGroups();
    } catch (err) {
      alert(err.message);
    }
  }

  // --- Render Helpers ---

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white relative overflow-hidden">
        <Snow />
        <div className="animate-pulse flex flex-col items-center gap-4 z-10">
          <Gift size={64} className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
          <p className="text-xl font-medium text-slate-300">Loading Secret Santa...</p>
        </div>
      </div>
    );
  }

  // --- Views ---

  const renderAdminLogin = () => (
    <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
      <Snow />
      <div className="max-w-md w-full space-y-8 glass-panel p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Admin Access</h1>
        </div>
        <div className="space-y-4">
          <Input
            label="Admin Password"
            type="password"
            value={adminPassword}
            onChange={setAdminPassword}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button onClick={handleAdminLogin} className="w-full">Login</Button>
        </div>
      </div>
    </div>
  );

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const renderAdminDashboard = () => {
    if (!adminData) return null;
    const { users, groups } = adminData;

    const handleCreateGroupAdmin = async () => {
      if (!newGroupName.trim()) return;
      try {
        const budget = prompt("Enter budget limit for this group (e.g. £50):", "£50");
        if (budget === null) return;

        await api.adminCreateGroup(adminPassword, newGroupName, budget);
        setNewGroupName('');
        handleAdminLogin();
      } catch (err) {
        alert(err.message);
      }
    };

    const handleAddParticipant = async (groupId) => {
      const name = prompt("Enter participant name:");
      if (!name) return;
      try {
        await api.adminAddParticipant(adminPassword, groupId, name);
        handleAdminLogin();
      } catch (err) {
        alert(err.message);
      }
    };

    const copyInviteLink = async (user) => {
      if (!user || !user.recoveryCode) {
        alert("User data missing, cannot generate link.");
        return;
      }
      const link = `${window.location.origin}/?login=${user.recoveryCode}`;
      copyToClipboard(link, `Invite link for ${user.displayName}`);
    };

    const handleDeleteGroup = async (groupId) => {
      if (!confirm('Are you sure you want to delete this group? This cannot be undone.')) return;
      try {
        await api.adminDeleteGroup(adminPassword, groupId);
        handleAdminLogin();
      } catch (err) {
        alert(err.message);
      }
    };

    const handleAdminDraw = async (groupId) => {
      if (!confirm('Are you sure you want to start the draw for this group?')) return;
      try {
        await api.adminStartDraw(adminPassword, groupId);
        handleAdminLogin();
        alert('Draw completed successfully!');
      } catch (err) {
        alert(err.message);
      }
    };

    const handleAdminReset = async (groupId) => {
      if (!confirm('Are you sure you want to UNMATCH this group? This will clear all current matches and allow you to add more people.')) return;
      try {
        await api.adminResetGroup(adminPassword, groupId);
        handleAdminLogin();
        alert('Group reset successfully!');
      } catch (err) {
        alert(err.message);
      }
    };

    const handleUpdateMatch = async (group, giverId, receiverId) => {
      const newResults = { ...group.results };
      if (receiverId) {
        newResults[giverId] = receiverId;
      } else {
        delete newResults[giverId];
      }

      try {
        await api.adminUpdateGroupResults(adminPassword, group.id, newResults);
        handleAdminLogin();
      } catch (err) {
        alert(err.message);
      }
    };

    const handleUpdateUser = async (userId, data) => {
      try {
        await api.adminUpdateUser(adminPassword, userId, data);
        handleAdminLogin();
      } catch (err) {
        console.error(err);
      }
    };

    const handleUpdateBudget = async (groupId, currentBudget) => {
      const newBudget = prompt("Enter new budget (e.g. £50):", currentBudget);
      if (newBudget === null || newBudget === currentBudget) return;

      try {
        await api.adminUpdateGroup(adminPassword, groupId, { budget: newBudget });
        handleAdminLogin();
      } catch (err) {
        alert(err.message);
      }
    };

    const handleUpdateTitle = async () => {
      const newTitle = prompt("Enter new front page title:", frontTitle);
      if (newTitle === null || newTitle === frontTitle) return;

      try {
        await api.adminUpdateConfig(adminPassword, { title: newTitle });
        setFrontTitle(newTitle);
        alert('Title updated successfully! Click "Exit Admin" and the login page will show the new title.');
      } catch (err) {
        alert(err.message);
      }
    };

    return (
      <div className="min-h-screen bg-slate-900 p-3 sm:p-6">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-8">
          {/* Header - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Dashboard</h1>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleUpdateTitle}
                className="flex-1 sm:flex-none bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
              >
                Edit Title
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 sm:flex-none border-2 border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
              >
                Exit Admin
              </button>
            </div>
          </div>

          {/* Create Group Section - Mobile Optimized */}
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Create New Group</h2>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <input
                type="text"
                placeholder="Group Name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <button
                onClick={handleCreateGroupAdmin}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Create
              </button>
            </div>
          </div>

          {/* Groups - Mobile Optimized with Collapsible Cards */}
          <div className="space-y-4">
            {Object.values(groups).map(group => {
              const isExpanded = expandedGroups[group.id];

              return (
                <div key={group.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                  {/* Group Header - Always Visible */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                            {group.name}
                          </h2>
                          <button
                            onClick={() => handleUpdateBudget(group.id, group.budget)}
                            className="flex-shrink-0 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-1 rounded-full font-normal transition-colors"
                            title="Edit Budget"
                          >
                            {group.budget || 'No budget'}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-slate-400">
                          <span className="bg-slate-800 px-2 py-1 rounded">ID: {group.id}</span>
                          <span className={`px-2 py-1 rounded font-medium ${group.status === 'DRAWN'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-amber-500/20 text-amber-400'
                            }`}>
                            {group.status}
                          </span>
                          <span className="bg-slate-800 px-2 py-1 rounded">
                            {group.participants.length} participants
                          </span>
                        </div>
                      </div>

                      {/* Expand/Collapse Button */}
                      <button
                        onClick={() => toggleGroup(group.id)}
                        className="flex-shrink-0 p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <svg
                          className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Action Buttons - Always Visible */}
                    <div className="flex flex-wrap gap-2">
                      {group.status === 'SETUP' && (
                        <button
                          onClick={() => setAdminExclusionGroup(group)}
                          className="flex-1 sm:flex-none border-2 border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white font-medium py-2 px-3 rounded-lg text-xs sm:text-sm transition-colors"
                        >
                          Exclusions
                        </button>
                      )}
                      {group.status === 'SETUP' && group.participants.length >= 3 && (
                        <button
                          onClick={() => handleAdminDraw(group.id)}
                          className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-lg text-xs sm:text-sm shadow-lg shadow-green-500/30 transition-all active:scale-95 flex items-center justify-center gap-1"
                        >
                          <Sparkles size={16} />
                          Draw
                        </button>
                      )}
                      {group.status === 'DRAWN' && (
                        <button
                          onClick={() => handleAdminReset(group.id)}
                          className="flex-1 sm:flex-none bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-3 rounded-lg text-xs sm:text-sm shadow-lg shadow-amber-500/30 transition-all active:scale-95 flex items-center justify-center gap-1"
                        >
                          <LogOut size={16} />
                          Unmatch
                        </button>
                      )}
                      <button
                        onClick={() => handleAddParticipant(group.id)}
                        className="flex-1 sm:flex-none bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-3 rounded-lg text-xs sm:text-sm transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus size={16} />
                        Add User
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="flex-1 sm:flex-none bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/50 font-medium py-2 px-3 rounded-lg text-xs sm:text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Expandable Content */}
                  {isExpanded && (
                    <div className="border-t border-white/10 bg-black/20">
                      {/* Mobile: Card View, Desktop: Table View */}
                      <div className="block sm:hidden">
                        {/* Mobile Card View */}
                        <div className="divide-y divide-slate-700">
                          {group.participants.map(p => {
                            const user = users[p.userId];
                            const matchId = group.results?.[p.userId];
                            const matchedUser = matchId ? group.participants.find(pp => pp.userId === matchId) : null;

                            return (
                              <div key={p.userId} className="p-4 space-y-3">
                                {/* Participant Name */}
                                <div className="flex items-center justify-between">
                                  <h3 className="font-bold text-white text-base">
                                    {p.name}
                                  </h3>
                                  {p.userId === group.adminId && (
                                    <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded">
                                      Admin
                                    </span>
                                  )}
                                </div>

                                {/* Invite Link */}
                                <button
                                  onClick={() => copyInviteLink(user)}
                                  className="w-full text-indigo-400 hover:text-indigo-300 text-sm flex items-center justify-center gap-2 bg-indigo-500/10 px-3 py-2 rounded-lg border border-indigo-500/30 hover:bg-indigo-500/20 transition-colors"
                                >
                                  <Copy size={16} />
                                  Copy Invite Link
                                </button>

                                {/* Wishlist */}
                                <div>
                                  <label className="text-xs text-slate-400 mb-1 block">Wishlist</label>
                                  <textarea
                                    defaultValue={user?.wishlist || ''}
                                    onBlur={(e) => handleUpdateUser(p.userId, { wishlist: e.target.value })}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-y min-h-[80px]"
                                    placeholder="Edit wishlist..."
                                  />
                                </div>

                                {/* Dislikes */}
                                <div>
                                  <label className="text-xs text-slate-400 mb-1 block">Dislikes</label>
                                  <textarea
                                    defaultValue={user?.dislikes || ''}
                                    onBlur={(e) => handleUpdateUser(p.userId, { dislikes: e.target.value })}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-y min-h-[80px]"
                                    placeholder="Edit dislikes..."
                                  />
                                </div>

                                {/* Matched To */}
                                <div>
                                  <label className="text-xs text-slate-400 mb-1 block">Matched To</label>
                                  <select
                                    value={matchId || ''}
                                    onChange={(e) => handleUpdateMatch(group, p.userId, e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none"
                                  >
                                    <option value="">Not drawn</option>
                                    {group.participants.map(option => (
                                      <option
                                        key={option.userId}
                                        value={option.userId}
                                        disabled={option.userId === p.userId}
                                      >
                                        {option.name}
                                      </option>
                                    ))}
                                  </select>
                                  {matchedUser && (
                                    <p className="text-xs text-green-400 mt-1">→ {matchedUser.name}</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Desktop Table View */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                          <thead className="text-xs uppercase bg-slate-800 text-slate-400">
                            <tr>
                              <th className="px-4 py-3 rounded-tl-lg">Participant</th>
                              <th className="px-4 py-3">Invite Link</th>
                              <th className="px-4 py-3">Wishlist</th>
                              <th className="px-4 py-3">Dislikes</th>
                              <th className="px-4 py-3 rounded-tr-lg">Matched To</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {group.participants.map(p => {
                              const user = users[p.userId];
                              const matchId = group.results?.[p.userId];

                              return (
                                <tr key={p.userId} className="hover:bg-slate-800/50">
                                  <td className="px-4 py-3 font-medium text-white align-top">
                                    {p.name}
                                    {p.userId === group.adminId && (
                                      <span className="ml-2 text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                                        Admin
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 align-top">
                                    <button
                                      onClick={() => copyInviteLink(user)}
                                      className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/30 hover:bg-indigo-500/20 transition-colors"
                                    >
                                      <Copy size={12} /> Copy Link
                                    </button>
                                  </td>
                                  <td className="px-4 py-3 align-top">
                                    <textarea
                                      defaultValue={user?.wishlist || ''}
                                      onBlur={(e) => handleUpdateUser(p.userId, { wishlist: e.target.value })}
                                      className="w-full bg-slate-900/50 border border-slate-700 rounded p-2 text-xs text-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-y min-h-[60px]"
                                      placeholder="Edit wishlist..."
                                    />
                                  </td>
                                  <td className="px-4 py-3 align-top">
                                    <textarea
                                      defaultValue={user?.dislikes || ''}
                                      onBlur={(e) => handleUpdateUser(p.userId, { dislikes: e.target.value })}
                                      className="w-full bg-slate-900/50 border border-slate-700 rounded p-2 text-xs text-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-y min-h-[60px]"
                                      placeholder="Edit dislikes..."
                                    />
                                  </td>
                                  <td className="px-4 py-3 align-top">
                                    <select
                                      value={matchId || ''}
                                      onChange={(e) => handleUpdateMatch(group, p.userId, e.target.value)}
                                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white focus:border-indigo-500 outline-none"
                                    >
                                      <option value="">Not drawn</option>
                                      {group.participants.map(option => (
                                        <option
                                          key={option.userId}
                                          value={option.userId}
                                          disabled={option.userId === p.userId}
                                        >
                                          {option.name}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderLogin = () => (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/christmas-bg.png')" }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      <Snow />

      <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-red-600 to-red-800 shadow-[0_0_50px_rgba(220,38,38,0.6)] mb-4 animate-bounce border-4 border-white/10 backdrop-blur-md">
            <Gift size={56} className="text-white drop-shadow-md" />
          </div>

          <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-200 tracking-tighter drop-shadow-xl font-serif">
              {frontTitle}
            </h1>
          </div>

          <div className="glass-panel p-8 mt-12 border-white/10 shadow-2xl bg-black/30 backdrop-blur-xl transform hover:scale-105 transition-transform duration-500">
            <p className="text-xl text-white font-medium leading-relaxed">
              Use your <span className="text-red-400 font-bold border-b-2 border-red-400/50 pb-0.5">secret link</span> that was sent to you to access your group.
            </p>
          </div>
        </div>


      </div>

      <div className="absolute bottom-6 text-center w-full z-10 opacity-40">
        <p className="text-xs text-white uppercase tracking-[0.2em]">Merry Christmas 2025</p>
      </div>
    </div>
  );

  const renderGroupList = () => (
    <div className="max-w-md mx-auto w-full p-6 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
      <Snow />
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-lg shadow-red-500/30 mb-4">
          <Gift size={40} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Secret Santa</h1>
        <p className="text-slate-300">Welcome back, {user?.displayName}!</p>
      </div>

      {groups.length === 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-indigo-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-slate-300">
              <p className="font-semibold text-white mb-2">Getting Started</p>
              <ul className="space-y-1 text-slate-400">
                <li>• <strong className="text-slate-300">Create a group</strong> to organize a new Secret Santa</li>
                <li>• <strong className="text-slate-300">Join a group</strong> if someone shared a code with you</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Button onClick={() => setCreateModalOpen(true)} className="w-full" icon={Plus}>
          Create New Group
        </Button>
        <Button onClick={() => setJoinModalOpen(true)} variant="secondary" className="w-full" icon={Users}>
          Join Existing Group
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider ml-1">Your Groups</h2>
        {groups.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-slate-700/50 border-dashed">
            <p className="text-slate-500">You haven't joined any groups yet.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {groups.map(group => (
              <button
                key={group.id}
                onClick={() => {
                  setActiveGroupId(group.id);
                  setView('GROUP_DETAIL');
                }}
                className="flex items-center justify-between p-4 bg-slate-800 hover:bg-slate-750 rounded-xl border border-slate-700 transition-all group text-left"
              >
                <div>
                  <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors">{group.name}</h3>
                  <p className="text-sm text-slate-400">{group.participants.length} participants</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text - xs px - 2 py - 1 rounded - full font - medium ${group.status === 'DRAWN' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
                    } `}>
                    {group.status === 'DRAWN' ? 'DRAWN' : 'SETUP'}
                  </span>
                  <ArrowRight size={18} className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 pt-8 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-600">Logged in as <span className="text-slate-400 font-medium">{user?.displayName}</span></p>
          <button
            onClick={handleLogout}
            className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
        {user?.recoveryCode && (
          <div className="mt-3 pt-3 border-t border-slate-800/50">
            <p className="text-xs text-slate-600 mb-1">Your Recovery Code:</p>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono text-indigo-400 bg-slate-800 px-2 py-1 rounded">{user.recoveryCode}</code>
              <button
                onClick={() => copyToClipboard(user.recoveryCode, 'Recovery code')}
                className="p-1 hover:bg-slate-700 rounded text-slate-500 hover:text-indigo-400 transition-colors"
                title="Copy code"
              >
                <Copy size={14} />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">Save this to login again later</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderGroupDetail = () => {
    if (!activeGroup) return null;
    const isAdmin = activeGroup.adminId === user?.userId;

    return (
      <div className="max-w-2xl mx-auto w-full p-4 pb-24 animate-in fade-in duration-300 relative z-10">
        <Snow />
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setView('GROUP_LIST')} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-md">
            <Home size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white drop-shadow-md">{activeGroup.name}</h1>
          </div>
        </div>

        {/* Large Welcome Banner */}
        <div className="mb-8 text-center animate-in slide-in-from-top duration-500">
          <div className="bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-sm shadow-lg">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2 drop-shadow-lg">
              👋 Hello, {user?.displayName}!
            </h2>
            <p className="text-lg text-indigo-100 font-medium">
              Welcome to your Secret Santa group! 🎁
            </p>
            <p className="text-sm text-indigo-200/80 mt-2 max-w-xl mx-auto">
              Make sure to update your wishlist below so your Secret Santa knows what to get you!
            </p>
          </div>
        </div>

        {/* DRAW RESULT SECTION */}
        {activeGroup.status === 'DRAWN' && (
          <div className="mb-8 animate-in zoom-in-95 duration-500">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-400 mb-4 animate-bounce">
                <Gift size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white">You drew...</h2>
            </div>

            <div className="card text-center py-10 mb-6 border-red-500/30 shadow-[0_0_30px_rgba(220,38,38,0.15)] bg-gradient-to-b from-white/10 to-white/5">
              <h3 className="text-4xl font-black text-white mb-2 drop-shadow-lg">
                {recipientData?.displayName || 'Loading...'}
              </h3>
              <p className="text-red-200 text-sm font-medium uppercase tracking-widest mb-4">is your Secret Santa assignment!</p>

              {activeGroup.budget && activeGroup.budget !== '0' && (
                <div className="inline-block bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <p className="text-white font-bold text-sm">
                    Budget: <span className="text-amber-400">{activeGroup.budget}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="bg-amber-500/20 border border-amber-500/30 rounded-2xl p-5 mb-6 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-500/20 rounded-full">
                  <AlertCircle size={24} className="text-amber-300" />
                </div>
                <div className="text-sm">
                  <p className="font-bold text-amber-200 text-lg mb-1">Keep it secret!</p>
                  <p className="text-amber-100/80 leading-relaxed">Don't tell anyone who you drew. That's the whole point! 🤫</p>
                </div>
              </div>
            </div>

            {recipientData?.wishlist && (
              <div className="card mb-4 bg-indigo-500/10 border-indigo-500/20">
                <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Sparkles size={16} />
                  Their Wishlist
                </h3>
                <p className="text-white whitespace-pre-wrap leading-relaxed text-base">
                  {recipientData.wishlist}
                </p>
              </div>
            )}

            {recipientData?.dislikes && (
              <div className="card mb-8 bg-red-500/10 border-red-500/20">
                <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertCircle size={16} />
                  Avoid These
                </h3>
                <p className="text-red-200 whitespace-pre-wrap leading-relaxed text-base">
                  {recipientData.dislikes}
                </p>
              </div>
            )}

            <div className="border-b border-white/10 my-8"></div>
          </div>
        )}

        {/* Workflow Status */}
        {activeGroup.status === 'SETUP' && (
          <div className="glass-panel p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-green-400" />
              Setup Progress
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className={`w - 6 h - 6 rounded - full flex items - center justify - center font - bold ${activeGroup.participants.length >= 1 ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-white/10 text-white/30'} `}>
                  {activeGroup.participants.length >= 1 ? '✓' : '1'}
                </div>
                <span className={activeGroup.participants.length >= 1 ? 'text-white font-medium' : 'text-white/30'}>
                  Group created
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className={`w - 6 h - 6 rounded - full flex items - center justify - center font - bold ${activeGroup.participants.length >= 3 ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-white/10 text-white/30'} `}>
                  {activeGroup.participants.length >= 3 ? '✓' : '2'}
                </div>
                <span className={activeGroup.participants.length >= 3 ? 'text-white font-medium' : 'text-white/30'}>
                  At least 3 participants ({activeGroup.participants.length}/3)
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold bg-white/10 text-white/30">
                  3
                </div>
                <span className="text-white/50">
                  {isAdmin ? 'Click "Start Secret Santa Draw" below' : 'Wait for admin to start the draw'}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeGroup.status === 'SETUP' && activeGroup.participants.length < 3 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-amber-300 mb-1">Waiting for participants</p>
                <p className="text-amber-200/80">Share the code <strong className="text-amber-300">{activeGroup.id}</strong> with at least 2 more people to start the draw.</p>
              </div>
            </div>
          </div>
        )}

        {activeGroup.status === 'SETUP' && activeGroup.participants.length >= 3 && !isAdmin && (
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-indigo-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-indigo-300 mb-1">Ready to draw!</p>
                <p className="text-indigo-200/80">You have enough participants. The group admin will start the Secret Santa draw when everyone is ready.</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6">
          {/* My Profile Card */}
          <div className="card">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Users size={20} className="text-indigo-400" />
              Your Profile
            </h2>

            {/* Friendly greeting */}
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-4">
              <p className="text-indigo-200 text-sm leading-relaxed">
                👋 <strong className="text-white">Hi {user?.displayName || 'there'}!</strong> Help your Secret Santa find the perfect gift by sharing what you'd love to receive. The more details you add, the better! 🎁
              </p>
            </div>

            {successMessage && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4 flex items-center gap-2">
                <CheckCircle size={16} className="text-green-400" />
                <span className="text-sm text-green-300">{successMessage}</span>
              </div>
            )}
            <div className="space-y-4">
              <Input
                label="Display Name"
                value={displayNameInput}
                onChange={setDisplayNameInput}
                placeholder="e.g. John Doe"
              />
              <div>
                <label className="text-sm font-medium text-slate-400 ml-1 mb-1 block">Wishlist / Gift Ideas</label>
                <textarea
                  value={wishlistInput}
                  onChange={(e) => setWishlistInput(e.target.value)}
                  placeholder="What would you like? (e.g. Books, Coffee, Socks...)"
                  className="input-field min-h-[80px] resize-y"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-400 ml-1 mb-1 block">Dislikes / Allergies</label>
                <textarea
                  value={dislikesInput}
                  onChange={(e) => setDislikesInput(e.target.value)}
                  placeholder="Things to avoid (e.g. Peanuts, Scented candles...)"
                  className="input-field min-h-[80px] resize-y"
                />
              </div>
              <Button onClick={updateProfile} variant="secondary" className="w-full py-2 text-sm">
                Save Profile
              </Button>
              <p className="text-xs text-slate-500 text-center">
                💡 Tip: Update your wishlist so your Secret Santa knows what you'd like!
              </p>
            </div>
          </div>

          {/* Participants List */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users size={20} className="text-indigo-400" />
                Participants ({activeGroup.participants.length})
              </h2>
              {isAdmin && (
                <button
                  onClick={() => setExclusionModalOpen(true)}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider"
                >
                  Manage Exclusions
                </button>
              )}
            </div>
            <div className="space-y-2">
              {activeGroup.participants.map(p => (
                <div key={p.userId} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w - 8 h - 8 rounded - full flex items - center justify - center text - sm font - bold ${p.userId === activeGroup.adminId ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-300'
                      } `}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <span className={p.userId === user?.userId ? 'text-white font-medium' : 'text-slate-300'}>
                      {p.name} {p.userId === user?.userId && '(You)'}
                    </span>
                  </div>
                  {p.userId === activeGroup.adminId && (
                    <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-1 rounded-full">Admin</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Admin Actions */}
          {isAdmin && activeGroup.status === 'SETUP' && (
            <div className="card border-indigo-500/30 bg-indigo-500/5">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles size={20} className="text-indigo-400" />
                Admin Controls
              </h2>
              <div className="bg-slate-900/50 rounded-lg p-3 mb-4">
                <p className="text-slate-300 text-sm mb-2">✓ <strong>Before you draw:</strong></p>
                <ul className="text-slate-400 text-sm space-y-1 ml-4">
                  <li>• Make sure everyone has joined</li>
                  <li>• Ask participants to update their wishlists</li>
                  <li>• Set exclusions if needed (couples, etc.)</li>
                </ul>
              </div>
              {activeGroup.participants.length >= 3 && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4 flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-400" />
                  <span className="text-sm text-green-300">Ready! You have {activeGroup.participants.length} participants.</span>
                </div>
              )}
              <p className="text-slate-400 text-sm mb-4">
                Once you start the draw, each participant will be assigned their Secret Santa recipient. This cannot be easily undone.
              </p>
              <Button
                onClick={handleStartDraw}
                disabled={activeGroup.participants.length < 3}
                className="w-full"
                icon={Sparkles}
              >
                Start Secret Santa Draw
              </Button>
              {activeGroup.participants.length < 3 && (
                <p className="text-center text-xs text-red-400 mt-2">Need at least 3 participants.</p>
              )}
            </div>
          )}


        </div>
      </div>
    );
  };



  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Main View Switcher */}
      {view === 'LOGIN' && renderLogin()}
      {view === 'ADMIN_LOGIN' && renderAdminLogin()}
      {view === 'ADMIN_DASHBOARD' && renderAdminDashboard()}
      {view === 'GROUP_LIST' && renderGroupList()}
      {view === 'GROUP_DETAIL' && renderGroupDetail()}

      {/* Modals */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Group">
        <div className="space-y-4">
          <p className="text-sm text-slate-400 mb-4">
            Give your Secret Santa group a name. You'll get a code to share with participants.
          </p>
          <Input
            label="Group Name"
            placeholder="e.g. Office Party 2024"
            value={newGroupName}
            onChange={setNewGroupName}
          />
          <Button onClick={handleCreateGroup} className="w-full" disabled={!newGroupName.trim()}>Create Group</Button>
        </div>
      </Modal>

      <Modal isOpen={isJoinModalOpen} onClose={() => setJoinModalOpen(false)} title="Join Group">
        <div className="space-y-4">
          <p className="text-sm text-slate-400 mb-4">
            Enter the 6-digit code that the group organizer shared with you.
          </p>
          <Input
            label="Join Code"
            placeholder="e.g. 123456"
            value={joinCodeInput}
            onChange={setJoinCodeInput}
          />
          <Button onClick={handleJoinGroup} className="w-full" disabled={!joinCodeInput.trim()}>Join Group</Button>
        </div>
      </Modal>

      {/* Admin Exclusion Modal */}
      {adminExclusionGroup && (
        <Modal isOpen={!!adminExclusionGroup} onClose={() => setAdminExclusionGroup(null)} title={`Exclusions: ${adminExclusionGroup.name}`}>
          <div className="space-y-4 sm:space-y-6 max-h-[60vh] overflow-y-auto p-1">
            <p className="text-xs sm:text-sm text-slate-400">
              Select participants to exclude. A checked box means the person on the left <strong>cannot</strong> draw the person on the right.
            </p>
            {adminExclusionGroup.participants.map(p1 => (
              <div key={p1.userId} className="bg-slate-900/50 p-3 sm:p-4 rounded-xl border border-slate-700">
                <h4 className="font-bold text-white mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0"></span>
                  <span className="truncate">{p1.name}</span>
                  <span className="text-slate-400 font-normal text-xs sm:text-sm whitespace-nowrap">cannot draw:</span>
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {adminExclusionGroup.participants.filter(p2 => p2.userId !== p1.userId).map(p2 => {
                    const isExcluded = adminExclusionGroup.exclusions?.[p1.userId]?.includes(p2.userId);
                    return (
                      <label
                        key={p2.userId}
                        className={`
                          flex items-center gap-3 p-3 sm:p-3.5 rounded-lg cursor-pointer transition-all border
                          ${isExcluded
                            ? 'bg-red-500/10 border-red-500/50'
                            : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                          }
                        `}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={!!isExcluded}
                          onChange={() => handleAdminExclusionUpdate(adminExclusionGroup.id, p1.userId, p2.userId)}
                        />
                        <span className={`text-sm sm:text-base ${isExcluded ? 'text-red-200 font-medium' : 'text-slate-300'}`}>
                          {p2.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      <Modal isOpen={isExclusionModalOpen} onClose={() => setExclusionModalOpen(false)} title="Manage Exclusions">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <p className="text-sm text-slate-400 mb-4">
            Select who cannot draw whom. Useful for couples or previous year's matches.
          </p>
          {activeGroup?.participants.map(p1 => (
            <div key={p1.userId} className="bg-slate-900/50 p-4 rounded-xl">
              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                {p1.name} cannot draw:
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeGroup.participants.filter(p2 => p2.userId !== p1.userId).map(p2 => {
                  const isExcluded = activeGroup.exclusions?.[p1.userId]?.includes(p2.userId);
                  return (
                    <button
                      key={p2.userId}
                      onClick={() => handleExclusionUpdate(p1.userId, p2.userId)}
                      className={`
      px - 3 py - 1.5 rounded - lg text - sm font - medium transition - all border
                        ${isExcluded
                          ? 'bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                        }
      `}
                    >
                      {p2.name}
                      {isExcluded && <X size={14} className="inline ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal isOpen={isRecoveryCodeModalOpen} onClose={() => setRecoveryCodeModalOpen(false)} title="Save Your Recovery Code!">
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-200">
                <p className="font-semibold text-amber-300 mb-1">Important!</p>
                <p>Save this code to return to your account later. Without it, you won't be able to access your groups.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-lg p-6 text-center">
            <p className="text-sm text-slate-400 mb-2">Your Recovery Code</p>
            <div className="text-4xl font-bold text-indigo-400 tracking-widest mb-4 font-mono">
              {userRecoveryCode}
            </div>
            <button
              onClick={() => copyToClipboard(userRecoveryCode, 'Recovery code')}
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2 mx-auto"
            >
              <Copy size={16} />
              Copy to clipboard
            </button>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-sm text-slate-300 mb-2">💡 <strong>How to save it:</strong></p>
            <ul className="text-sm text-slate-400 space-y-1 ml-4">
              <li>• Copy it to your notes app</li>
              <li>• Take a screenshot</li>
              <li>• Write it down somewhere safe</li>
            </ul>
          </div>

          <Button onClick={() => setRecoveryCodeModalOpen(false)} className="w-full">
            I've Saved My Code
          </Button>
        </div>
      </Modal>
    </div>
  );
}
