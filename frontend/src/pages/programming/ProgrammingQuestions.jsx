import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Loader2, Brain, BookOpen } from 'lucide-react';
import { programmingAPI } from '../../services/programmingAPI';

const ProgrammingQuestions = () => {
  const { section, topic, difficulty } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, [section, topic, difficulty]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await programmingAPI.getAll({ section, topic, difficulty });
      setQuestions(response.data.questions || []);
    } catch (err) {
      console.error('Error:', err);
      setError('No questions available for this topic and level.');
    } finally {
      setLoading(false);
    }
  };

  const formatName = (str) => str.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-indigo-500" />
          <p className="text-slate-500 dark:text-slate-400">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
          <ArrowLeft size={24} />
        </button>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white capitalize">
            {formatName(topic)}
          </h1>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="capitalize">{formatName(section)}</span>
            <span>•</span>
            <span className="capitalize">{difficulty}</span>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg">
        {error ? (
          <div className="p-12 text-center">
            <BookOpen className="w-20 h-20 mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">{error}</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Try another topic or difficulty level</p>
            <button 
              onClick={() => navigate(-1)} 
              className="btn btn-outline-primary px-6 py-2"
            >
              Back to Difficulty
            </button>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center">
            <Brain className="w-20 h-20 mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">No questions yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Questions will appear here soon</p>
            <button onClick={() => navigate(-1)} className="btn btn-outline-primary px-6 py-2">
              Back to Difficulty
            </button>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                {questions.length} Questions
              </h2>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-96 overflow-y-auto">
              {questions.map((question) => (
                <Link 
                  key={question._id} 
                  to={`/programming/${section}/${topic}/${difficulty}/${question._id}`}
                  className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-slate-800 dark:text-white line-clamp-2 group-hover:text-primary-600 mb-2">
                        {question.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
                        {question.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-full font-medium">
                          {question.section}
                        </span>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 rounded-full font-medium">
                          {question.topic}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform ml-4 flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProgrammingQuestions;

