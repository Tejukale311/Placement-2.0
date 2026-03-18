
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import {
  User,
  Mail,
  Phone,
  Award,
  Brain,
  Code,
  FileText,
  Star,
  Edit,
  Save,
  Loader2,
  TrendingUp
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    userType: user?.userType || ''
  });

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await userAPI.getStats();
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await userAPI.updateProfile(formData);
      if (response.data.success) {
        updateUser(response.data.user);
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeLabel = (type) => {
    switch (type) {
      case 'student': return 'Student';
      case 'graduate': return 'Graduate Job Seeker';
      case 'it-professional': return 'IT Professional';
      case 'non-it-professional': return 'Non-IT Professional';
      default: return type;
    }
  };

  const statCards = [
    {
      label: 'Total Score',
      value: user?.score || 0,
      icon: Star,
      color: 'from-amber-400 to-orange-500',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30'
    },
    {
      label: 'Questions Solved',
      value: user?.totalQuestionsSolved || 0,
      icon: Brain,
      color: 'from-blue-400 to-indigo-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      label: 'Coding Solved',
      value: user?.totalCodingSolved || 0,
      icon: Code,
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      label: 'Tests Completed',
      value: user?.testsCompleted || 0,
      icon: FileText,
      color: 'from-purple-400 to-pink-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            Profile
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage your account information
          </p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
                {user?.name}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-2">
                {getUserTypeLabel(user?.userType)}
              </p>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm">
                <Award className="w-4 h-4" />
                Score: {user?.score || 0}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <Mail className="w-5 h-5 text-slate-400" />
                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="flex-1 px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                  />
                ) : (
                  <span className="text-sm">{user?.email}</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <Phone className="w-5 h-5 text-slate-400" />
                {editing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="flex-1 px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                  />
                ) : (
                  <span className="text-sm">{user?.phone}</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <User className="w-5 h-5 text-slate-400" />
                {editing ? (
                  <select
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                    className="flex-1 px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                  >
                    <option value="">Select type</option>
                    <option value="student">Student</option>
                    <option value="graduate">Graduate Job Seeker</option>
                    <option value="it-professional">IT Professional</option>
                    <option value="non-it-professional">Non-IT Professional</option>
                  </select>
                ) : (
                  <span className="text-sm">{getUserTypeLabel(user?.userType)}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                <div className={`p-2.5 rounded-lg ${stat.bgColor} inline-block mb-3`}>
                  <stat.icon className={`w-5 h-5 bg-gradient-to-br ${stat.color} text-white rounded`} />
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Progress Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              Your Progress
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-300">Aptitude Progress</span>
                  <span className="text-sm font-medium text-slate-800 dark:text-white">
                    {stats?.aptitude?.total || 0} questions
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(((stats?.aptitude?.correct || 0) / 100) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-300">Coding Progress</span>
                  <span className="text-sm font-medium text-slate-800 dark:text-white">
                    {stats?.coding?.total || 0} problems
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(((stats?.coding?.accepted || 0) / 50) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 dark:text-slate-300">Mock Tests</span>
                  <span className="text-sm font-medium text-slate-800 dark:text-white">
                    {stats?.mockTests?.total || 0} tests
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(((stats?.mockTests?.passed || 0) / 10) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
              Account Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Member Since</span>
                <span className="text-slate-800 dark:text-white">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Last Active</span>
                <span className="text-slate-800 dark:text-white">
                  {user?.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 dark:text-slate-400">Account Status</span>
                <span className="text-emerald-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

