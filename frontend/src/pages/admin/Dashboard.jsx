import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
// eslint-disable-next-line no-unused-vars
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      navigate('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8000/admin/stats', {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch admin stats');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin, navigate]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Problems"
              value={stats?.totalProblems || 0}
              icon="📚"
              color="bg-blue-500"
            />
            <StatCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              icon="👥"
              color="bg-green-500"
            />
            <StatCard
              title="Total Submissions"
              value={stats?.totalSubmissions || 0}
              icon="📝"
              color="bg-purple-500"
            />
            <StatCard
              title="Acceptance Rate"
              value={`${stats?.acceptanceRate || 0}%`}
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
            <p className="text-gray-600">
              This section will allow you to manage all problems. Feature coming soon!
            </p>
          </div>
        );
      case 'users':
        return (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">User Management</h3>
            <p className="text-gray-600">
              This section will allow you to manage users. Feature coming soon!
            </p>
          </div>
        );
      case 'submissions':
        return (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Submission History</h3>
            <p className="text-gray-600">
              View and manage all user submissions. Feature coming soon!
            </p>
          </div>
        );
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