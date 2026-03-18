import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockTestsAPI } from '../../services/api';
import {
  FileText,
  Clock,
  ChevronRight,
  Loader2,
  Search,
  Users,
  ArrowRight,
  Target,
  Sparkles,
  Zap
} from 'lucide-react';

const MockTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await mockTestsAPI.getAll();
      if (response.data.success) {
        setTests(response.data.tests || []);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };


  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' };
      case 'medium': return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' };
      case 'hard': return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' };
      default: return { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-400' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <p className="text-slate-500 dark:text-slate-400">Loading tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/30">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Mock Tests</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400">Practice with real-world placement test simulations</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" placeholder="Search tests..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input pl-12" />
        </div>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="form-input sm:w-48">
          <option value="all">All Categories</option>
          <option value="placement">Placement</option>
          <option value="campus">Campus</option>
          <option value="company-specific">Company Specific</option>
        </select>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTests.map((test, index) => {
          const diffStyle = getDifficultyColor(test.difficulty);
          return (
            <div key={test._id} className="card card-hover p-5 group" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${
                  test.company === 'TCS' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' :
                  test.company === 'Infosys' ? 'bg-red-100 dark:bg-red-900/30 text-red-500' :
                  test.company === 'Wipro' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-500' :
                  'bg-purple-100 dark:bg-purple-900/30 text-purple-500'
                }`}>
                  <Target className="w-5 h-5" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${diffStyle.bg} ${diffStyle.text}`}>{test.difficulty}</span>
              </div>

              <h3 className="font-bold text-slate-800 dark:text-white mb-2 group-hover:text-primary-500 transition-colors">{test.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{test.description || `Prepare for ${test.company} placement test`}</p>

              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-5">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{test.duration} min</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>{test.totalQuestions} Q</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{test.attempts || 0}</span>
                </div>
              </div>

              <Link to={`/mock-tests/${test._id}`} className="btn btn-primary w-full">
                <Zap className="w-5 h-5" />
                Start Test
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          );
        })}
      </div>

      {filteredTests.length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <FileText className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No tests found</h3>
          <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default MockTests;

