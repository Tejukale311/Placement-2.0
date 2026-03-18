import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

import { ArrowLeft, ChevronRight, Loader2, Brain, Target, Zap } from 'lucide-react';
import { programmingAPI } from '../../services/programmingAPI';

import { difficulties } from '../../data/programmingConfig';

const ProgrammingDifficulty = () => {
  const { section, topic } = useParams();
  const navigate = useNavigate();
  const [questionCount, setQuestionCount] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestionCounts();
  }, [section, topic]);

  const fetchQuestionCounts = async () => {
    setLoading(true);
    try {
      const counts = await Promise.all(
        difficulties.map(async (diff) => {
          try {
            const response = await programmingAPI.getAll({ section, topic, difficulty: diff, page: 1, limit: 1 });
            return { difficulty: diff, count: response.data.count || 0 };
          } catch {
            return { difficulty: diff, count: 0 };
          }
        })
      );
      const countMap = counts.reduce((acc, item) => {
        acc[item.difficulty] = item.count;
        return acc;
      }, {});
      setQuestionCount(countMap);
    } catch (error) {
      console.error('Error fetching counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatName = (str) => {
    return str.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return Target;
      case 'intermediate': return Brain;
      case 'advanced': return Zap;
      default: return Target;
    }
  };

  const getDifficultyGradient = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'from-emerald-500 to-green-500';
      case 'intermediate': return 'from-amber-500 to-orange-500';
      case 'advanced': return 'from-rose-500 to-red-500';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{formatName(topic)}</h1>
          <p className="text-slate-500 dark:text-slate-400">Select difficulty level</p>
        </div>
      </div>

      {/* Difficulty Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {difficulties.map((difficulty, index) => {
          const DifficultyIcon = getDifficultyIcon(difficulty);
          const count = questionCount[difficulty] || 0;
          
          return (
            <Link 
              key={difficulty}
              to={`/programming/${section}/${topic}/${difficulty}`}
              className="group card card-hover p-8 relative overflow-hidden h-48 flex flex-col justify-between"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${getDifficultyGradient(difficulty)} shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02]`}>
                <DifficultyIcon className="w-12 h-12 text-white mb-4 opacity-90" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-xl text-slate-800 dark:text-white capitalize">
                  {difficulty}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>{count} questions</span>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-primary-500 absolute right-4 top-1/2 -translate-y-1/2 group-hover:translate-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300" />
            </Link>
          );
        })}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mr-3" />
          <span className="text-slate-500">Loading difficulty levels...</span>
        </div>
      )}
    </div>
  );
};

export default ProgrammingDifficulty;

