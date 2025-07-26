import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AdminSubmissions from './AdminSubmissions';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Problems state
  const [problems, setProblems] = useState([]);
  const [problemsLoading, setProblemsLoading] = useState(false);
  const [problemsError, setProblemsError] = useState('');

  // Users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  // Fetch stats on mount
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    const fetchStats = async () => {
      try {
        const response = await fetch(`${backendUrl}/admin/stats`, {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch admin stats');
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    // eslint-disable-next-line
  }, [isAdmin, navigate]);

  // Fetch problems when tab is selected
  useEffect(() => {
    if (activeTab === 'problems') {
      setProblemsLoading(true);
      setProblemsError('');
      fetch(`${backendUrl}/problems`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => setProblems(Array.isArray(data) ? data : []))
        .catch(() => setProblemsError('Failed to load problems'))
        .finally(() => setProblemsLoading(false));
    }
    // eslint-disable-next-line
  }, [activeTab]);

  // Fetch users when tab is selected
  useEffect(() => {
    if (activeTab === 'users') {
      setUsersLoading(true);
      setUsersError('');
      fetch(`${backendUrl}/admin/users`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => setUsers(data.users || []))
        .catch(() => setUsersError('Failed to load users'))
        .finally(() => setUsersLoading(false));
    }
    // eslint-disable-next-line
  }, [activeTab]);

  // Problem actions
  const handleDeleteProblem = async (problemCode) => {
    if (!window.confirm('Are you sure you want to delete this problem?')) return;
    try {
      const res = await fetch(`${backendUrl}/problems/${problemCode}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setProblems(problems.filter(p => p.problemCode !== problemCode));
      } else {
        alert('Failed to delete problem');
      }
    } catch {
      alert('Failed to delete problem');
    }
  };

  const handleEditProblem = (problemCode) => {
    navigate(`/admin/problems/edit/${problemCode}`);
  };

  // User actions
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`${backendUrl}/admin/users/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setUsers(users.filter(u => u._id !== id));
      } else {
        alert('Failed to delete user');
      }
    } catch {
      alert('Failed to delete user');
    }
  };

  const handlePromoteUser = async (id) => {
    try {
      const res = await fetch(`${backendUrl}/admin/users/${id}/promote`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        setUsers(users.map(u => u._id === id ? { ...u, role: 'admin' } : u));
      } else {
        alert('Failed to promote user');
      }
    } catch {
      alert('Failed to promote user');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Problems"
              value={stats?.stats?.totalProblems || 0}
              icon="📚"
              color="bg-blue-500"
            />
            <StatCard
              title="Total Users"
              value={stats?.stats?.totalUsers || 0}
              icon="👥"
              color="bg-green-500"
            />
            <StatCard
              title="Total Submissions"
              value={stats?.stats?.totalSubmissions || 0}
              icon="📝"
              color="bg-purple-500"
            />
            <StatCard
              title="Acceptance Rate"
              value={`${stats?.stats?.acceptanceRate || 0}%`}
              icon="✅"
              color="bg-yellow-500"
            />
          </div>
        );
      case 'problems':
        return (
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Problem Management</h3>
              <Link
                to="/admin/problems/create"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Add New Problem
              </Link>
            </div>
            {problemsLoading ? (
              <div>Loading problems...</div>
            ) : problemsError ? (
              <div className="text-red-600">{problemsError}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Difficulty</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {problems.map(problem => (
                      <tr key={problem._id || problem.problemCode}>
                        <td className="px-4 py-2">{problem.title}</td>
                        <td className="px-4 py-2">{problem.problemCode}</td>
                        <td className="px-4 py-2">{problem.difficulty}</td>
                        <td className="px-4 py-2">
                          <div className="flex flex-wrap gap-1">
                            {problem.tags && problem.tags.map(tag => (
                              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{tag}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-2 space-x-2">
                          <button
                            onClick={() => handleEditProblem(problem.problemCode)}
                            className="text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProblem(problem.problemCode)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case 'users':
        return (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">User Management</h3>
            {usersLoading ? (
              <div>Loading users...</div>
            ) : usersError ? (
              <div className="text-red-600">{usersError}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(u => (
                      <tr key={u._id}>
                        <td className="px-4 py-2">{u.firstName} {u.lastName}</td>
                        <td className="px-4 py-2">{u.email}</td>
                        <td className="px-4 py-2">{u.role}</td>
                        <td className="px-4 py-2 space-x-2">
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handlePromoteUser(u._id)}
                              className="text-blue-600 hover:underline"
                            >
                              Promote
                            </button>
                          )}
                          {u._id !== user?._id && (
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case 'submissions':
        return <AdminSubmissions />;
      default:
        return <div>Select a tab</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-left rounded-md ${
                activeTab === 'overview'
                  ? 'bg-indigo-100 text-indigo-700 font-medium'
                  : 'hover:bg-gray-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('problems')}
              className={`px-4 py-2 text-left rounded-md ${
                activeTab === 'problems'
                  ? 'bg-indigo-100 text-indigo-700 font-medium'
                  : 'hover:bg-gray-100'
              }`}
            >
              Problems
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 text-left rounded-md ${
                activeTab === 'users'
                  ? 'bg-indigo-100 text-indigo-700 font-medium'
                  : 'hover:bg-gray-100'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-4 py-2 text-left rounded-md ${
                activeTab === 'submissions'
                  ? 'bg-indigo-100 text-indigo-700 font-medium'
                  : 'hover:bg-gray-100'
              }`}
            >
              Submissions
            </button>
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <div className={`${color} h-2`}></div>
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  </div>
);

export default AdminDashboard;