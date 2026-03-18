

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { aptitudeAPI, questionsAPI, userAPI } from '../../services/api';
import {
  Brain,
  ChevronRight,
  CheckCircle,
  XCircle,
  Bookmark,
  Loader2,
  ArrowLeft,
  Zap,
  ArrowRight,
  Sparkles,
  Search,
  BookOpen,
  Calculator,
  MessageSquare,
  BarChart3,
  Lightbulb,
  Eye
} from 'lucide-react';

import { categoryConfig, aptitudeTopics, getTopicColor } from '../../data/aptitudeConfig';


const Aptitude = () => {
  const { category, topic } = useParams();
  const navigate = useNavigate();
  
  const [view, setView] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]); // Array for multi-select
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [topicCounts, setTopicCounts] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
      if (topic) {
        setView('practice');
        fetchQuestions();
      } else {
        setView('topics');
        fetchTopics(category);
      }
    } else {
      setView('categories');
    }
  }, [category, topic]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await aptitudeAPI.getCategories();
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(Object.keys(categoryConfig).map(key => ({
        id: key,
        name: categoryConfig[key].name,
        totalQuestions: 0
      })));
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async (cat) => {
    setLoading(true);
    try {
      const response = await aptitudeAPI.getTopicsWithCounts({ category: cat });
      if (response.data.success) {
        setTopics(response.data.topics || []);
        const counts = {};
        (response.data.topics || []).forEach(t => {
          counts[t.id] = t.totalQuestions || 0;
        });
        setTopicCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
      setTopics(aptitudeTopics[cat]?.map(t => ({ ...t, totalQuestions: 0 })) || []);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await aptitudeAPI.getQuestions({
        category,
        topic,
        limit: 20
      });
      if (response.data.success) {
        setQuestions(response.data.questions || []);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async () => {
    const question = questions[currentQuestion];
    if (!question) return;

    let submitData;
    if (question.questionType === 'single') {
      if (selectedAnswers.length !== 1) {
        alert('Please select exactly one answer');
        return;
      }
      submitData = { answer: selectedAnswers[0] };
    } else {
      if (selectedAnswers.length === 0) {
        alert('Please select at least one answer');
        return;
      }
      submitData = { answers: selectedAnswers };
    }

    setLoading(true);
    try {
      const response = await questionsAPI.submitAnswer(question._id, submitData);
      if (response.data.success) {
        setResult(response.data);
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setResult({
        isCorrect: false,
        questionType: question.questionType,
        correctAnswers: question.correctAnswers || [question.answer]
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswers([]);
      setSubmitted(false);
      setResult(null);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedAnswers([]);
      setSubmitted(false);
      setResult(null);
    }
  };

  const handleBookmark = async () => {
    try {
      await userAPI.addBookmark({
        questionId: questions[currentQuestion]._id,
        questionType: 'aptitude'
      });
    } catch (error) {
      console.error('Error adding bookmark:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' };
      case 'medium': return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' };
      case 'hard': return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' };
      default: return { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-500' };
    }
  };

  // Categories View
  if (view === 'categories') {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-500/30">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Aptitude Practice</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">Choose a category to start practicing</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" placeholder="Search categories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input pl-12" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.filter(cat => cat.name?.toLowerCase().includes(searchTerm.toLowerCase())).map((cat, index) => {
              const config = categoryConfig[cat.id] || {};
              const Icon = config.icon || Brain;
              return (
                <button key={cat.id} onClick={() => navigate(`/aptitude/${cat.id}`)} className="group card card-hover p-5 text-left" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${config.gradient || 'from-blue-500 to-cyan-500'} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 dark:text-white group-hover:text-primary-500 transition-colors">{cat.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{config.description || 'Practice questions'}</p>
                      <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded mt-2 inline-block">{cat.totalQuestions || 0} Questions</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Topics View
  if (view === 'topics') {
    const filteredTopics = topics.filter(t => t.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    const config = categoryConfig[selectedCategory] || {};
    const Icon = config.icon || Brain;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/aptitude" className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </Link>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${config.gradient || 'from-blue-500 to-cyan-500'}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">{config.name || 'Aptitude'}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">{filteredTopics.length} topics available</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" placeholder="Search topics..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input pl-12" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No topics available</h3>
            <p className="text-slate-500 dark:text-slate-400">Topics will appear here once questions are added by admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTopics.map((tp, index) => (
              <button key={tp.id} onClick={() => navigate(`/aptitude/${selectedCategory}/${tp.id}`)} className="group card card-hover p-5 text-left" style={{ animationDelay: `${index * 30}ms` }}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${getTopicColor(selectedCategory)} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-white font-bold text-lg">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 dark:text-white group-hover:text-primary-500 transition-colors">{tp.name}</h3>
                    <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded mt-2 inline-block">{topicCounts[tp.id] || 0} Questions</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Practice View - Loading
  if (loading && questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <p className="text-slate-500 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Practice View - No Questions
  if (questions.length === 0) {
    const topicName = aptitudeTopics[category]?.find(t => t.id === topic)?.name || topic;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to={`/aptitude/${category}`} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">{topicName}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">No questions available for this topic</p>
          </div>
        </div>

        <div className="card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No questions available</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">There are no questions for this topic yet. Check back later!</p>
          <Link to={`/aptitude/${category}`} className="btn btn-primary">
            <ArrowLeft className="w-5 h-5" /> Back to topics
          </Link>
        </div>
      </div>
    );
  }

  // Practice View - Questions
  const question = questions[currentQuestion];
  const difficultyStyle = getDifficultyColor(question.difficulty);
  const currentTopicColor = getTopicColor(category);
  const topicName = aptitudeTopics[category]?.find(t => t.id === topic)?.name || topic;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to={`/aptitude/${category}`} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${currentTopicColor} text-white text-xs font-medium`}>{topicName}</div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Question {currentQuestion + 1} of {questions.length}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={handleBookmark} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Bookmark className="w-5 h-5 text-slate-400 hover:text-primary-500" />
          </button>
          <div className={`px-4 py-2 rounded-xl ${difficultyStyle.bg}`}>
            <span className={`text-sm font-semibold ${difficultyStyle.text} flex items-center gap-2`}>
              <span className={`w-2 h-2 rounded-full ${difficultyStyle.dot}`}></span>
              {question.difficulty}
            </span>
          </div>
        </div>
      </div>

      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
      </div>

      <div className="card p-6 md:p-8">
        <h2 className="text-lg md:text-xl font-medium text-slate-800 dark:text-white mb-8 leading-relaxed">{question.question}</h2>

        {question.questionType === 'single' ? (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button 
                key={index} 
                onClick={() => !submitted && setSelectedAnswers([index])} 
                disabled={submitted}
                className={`quiz-option w-full p-4 rounded-xl transition-all border-2 ${
                  submitted 
                    ? (question.correctAnswers?.includes(index) ? 'border-success-400 bg-success-50' : selectedAnswers.includes(index) ? 'border-danger-400 bg-danger-50' : 'border-transparent')
                    : selectedAnswers.includes(index) 
                      ? 'border-primary-400 bg-primary-50 shadow-md' 
                      : 'hover:border-primary-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                    submitted && question.correctAnswers?.includes(index) 
                      ? 'bg-success-500 text-white' 
                      : submitted && selectedAnswers.includes(index) && !question.correctAnswers?.includes(index)
                        ? 'bg-danger-500 text-white' 
                        : selectedAnswers.includes(index) 
                          ? 'bg-primary-500 text-white shadow-md' 
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1 text-left text-slate-700 dark:text-slate-200">{option}</span>
                  {submitted && question.correctAnswers?.includes(index) && <CheckCircle className="w-6 h-6 text-success-500" />}
                  {submitted && selectedAnswers.includes(index) && !question.correctAnswers?.includes(index) && <XCircle className="w-6 h-6 text-danger-500" />}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Select all correct answers
              </p>
            </div>
            {question.options.map((option, index) => (
              <label key={index} className={`quiz-option w-full p-4 rounded-xl transition-all cursor-pointer border-2 flex items-center gap-4 ${
                submitted 
                  ? (question.correctAnswers?.includes(index) ? 'border-success-400 bg-success-50' : selectedAnswers.includes(index) ? 'border-danger-400 bg-danger-50' : 'border-transparent')
                  : selectedAnswers.includes(index) 
                    ? 'border-primary-400 bg-primary-50 shadow-md' 
                    : 'hover:border-primary-200 hover:shadow-md'
              }`}>
                <input
                  type="checkbox"
                  checked={selectedAnswers.includes(index)}
                  onChange={(e) => {
                    if (!submitted) {
                      setSelectedAnswers(
                        e.target.checked
                          ? [...selectedAnswers, index]
                          : selectedAnswers.filter(i => i !== index)
                      );
                    }
                  }}
                  disabled={submitted}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                    submitted && question.correctAnswers?.includes(index) 
                      ? 'bg-success-500 text-white' 
                      : submitted && selectedAnswers.includes(index) && !question.correctAnswers?.includes(index)
                        ? 'bg-danger-500 text-white' 
                        : selectedAnswers.includes(index) 
                          ? 'bg-primary-500 text-white shadow-md' 
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1 text-left text-slate-700 dark:text-slate-200">{option}</span>
                </div>
              </label>
            ))}
          </div>
        )}

        {submitted && (question.explanation || result?.explanation) && (
          <div className="mt-6 p-5 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
            <h4 className="font-semibold text-primary-800 dark:text-primary-300 mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Explanation
            </h4>
            <p className="text-sm text-primary-700 dark:text-primary-400">{question.explanation || result?.explanation}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <button onClick={handlePrevious} disabled={currentQuestion === 0} className="btn btn-secondary">
          <ArrowLeft className="w-5 h-5" /> Previous
        </button>

        {!submitted ? (
          <button onClick={handleAnswer} disabled={selectedAnswers.length === 0 || loading} className="btn btn-primary">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : <><Zap className="w-5 h-5" /> Submit Answer ({selectedAnswers.length} selected)</>}
          </button>
        ) : (
          <button onClick={handleNext} disabled={currentQuestion === questions.length - 1} className="btn btn-primary">
            Next Question <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {submitted && result && (
        <div className="card p-6">
          <div className="text-center space-y-4">
            <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center ${result?.isCorrect ? 'bg-success-100 dark:bg-success-900/30 border-4 border-success-400' : 'bg-danger-100 dark:bg-danger-900/30 border-4 border-danger-400'}`}>
              {result?.isCorrect ? <CheckCircle className="w-10 h-10 text-success-500" /> : <XCircle className="w-10 h-10 text-danger-500" />}
            </div>
            <div>
              <p className={`text-3xl font-bold ${result?.isCorrect ? 'text-success-500' : 'text-danger-500'}`}>
                {result?.isCorrect ? 'Correct!' : 'Try Again'}
              </p>
              {result?.questionType === 'multi' && !result.isCorrect && (
                <p className="text-sm text-slate-500 mt-2">
                  Correct: {result.correctAnswers?.map(i => String.fromCharCode(65 + i)).join(', ')}
                </p>
              )}
              {result?.score && (
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 mt-2">
                  +{result.score}/{result.maxScore} points
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Aptitude;


