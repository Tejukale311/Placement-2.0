
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { mockTestsAPI } from '../../services/api';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  BookOpen
} from 'lucide-react';

const TakeTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [sections, setSections] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState(null);
  const [previousAttempt, setPreviousAttempt] = useState(null);

  // localStorage persistence
  const storageKey = `mocktest-${id}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.timestamp > Date.now() - 24*60*60*1000) { // 24h validity
          setAnswers(data.answers || {});
          setTimeLeft(data.timeLeft || totalTime);
          setCurrentQuestion(data.currentQuestion || 0);
        }
      } catch (e) {
        console.error('Invalid saved data');
      }
    }
  }, [id, totalTime]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({
      answers,
      timeLeft,
      currentQuestion,
      totalTime,
      timestamp: Date.now()
    }));
  }, [answers, timeLeft, currentQuestion, totalTime, storageKey]);

  useEffect(() => {
    if (id) {
      fetchTest();
    }
  }, [id]);


  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && test) {
      handleSubmit();
    }
  }, [timeLeft, test]);

  const fetchTest = async () => {
    try {
      const response = await mockTestsAPI.getOne(id);
      if (response.data.success) {
        const dataTest = response.data.test;
        setTest(dataTest);
        setSections(dataTest.sections || []);
        // Flatten questions with section info
        const flatQuestions = dataTest.sections?.flatMap((section, secIdx) => 
          section.questions?.map(q => ({
            ...q, 
            sectionIndex: secIdx,
            sectionName: section.name || 'General'
          })) || []
        ) || [];
        setQuestions(flatQuestions);
        const totalSecs = dataTest.duration * 60 || 3600;
        setTotalTime(totalSecs);
        setTimeLeft(totalSecs);
        setPreviousAttempt(response.data.previousAttempt);
      }
    } catch (error) {
      console.error('Error fetching test:', error);
    } finally {
      setLoading(false);
    }
  };

  // Keep currentQuestion in bounds
  useEffect(() => {
    if (questions.length === 0) {
      setCurrentQuestion(0);
    } else if (currentQuestion >= questions.length) {
      setCurrentQuestion(questions.length - 1);
    }
  }, [questions.length, currentQuestion]);



const handleOptionChange = (questionId, index, isMulti) => {
    setAnswers(prev => {
      const current = prev[questionId] || (isMulti ? [] : -1);
      if (isMulti) {
        // Multi: toggle array
        if (current.includes(index)) {
          return {
            ...prev,
            [questionId]: current.filter(item => item !== index)
          };
        } else {
          return {
            ...prev,
            [questionId]: [...current, index].sort((a,b)=>a-b)
          };
        }
      } else {
        // Single: replace
        return {
          ...prev,
          [questionId]: index
        };
      }
    });
  };

  // Get section break points for nav coloring if needed
  const getQuestionNavClass = (index) => {
    const q = questions[index];
    if (!q) return '';
    const answered = answers[q._id] !== undefined;
    return answered ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-600';
  };



  const handleSubmit = async () => {
    setSubmitting(true);
    localStorage.removeItem(storageKey); // Clear saved progress
    try {
      const timeTaken = totalTime - timeLeft;
      const response = await mockTestsAPI.submitTest(id, {
        answers,
        timeTaken
      });

      if (response.data.success) {
        setResult(response.data.result);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
    } finally {
      setSubmitting(false);
    }
  };


  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30';
      case 'medium': return 'text-amber-500 bg-amber-100 dark:bg-amber-900/30';
      case 'hard': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      default: return 'text-slate-500 bg-slate-100 dark:bg-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
          Test not found
        </h3>
        <Link
          to="/mock-tests"
          className="text-primary-500 hover:text-primary-600"
        >
          Back to Mock Tests
        </Link>
      </div>
    );
  }

  // Show results if submitted
  if (result) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 text-center">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
            result.passed ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'
          }`}>
            {result.passed ? (
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            ) : (
              <XCircle className="w-10 h-10 text-red-500" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            {result.passed ? 'Congratulations!' : 'Keep Practicing!'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {result.passed 
              ? 'You have passed this mock test' 
              : 'You need more practice to pass this test'}
          </p>

          {result.sectionResults && result.sectionResults.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Topic-wise Analysis</h3>
              <div className="space-y-3">
                {result.sectionResults.map((sec, idx) => (
                  <div key={idx} className="card p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-slate-800 dark:text-white">{sec.sectionName}</span>
                      <span className="font-bold text-lg text-primary-500">{sec.percentage}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <span>{sec.correct}/{sec.total} correct</span>
                      <span>Score: {sec.score}/{sec.maxScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary-500">{Math.round(result.percentage || 0)}%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Overall</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-lg p-4 text-center">
              <p className="text-xl font-bold text-emerald-600">{result.correctAnswers || 0}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Correct</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-4 text-center">
              <p className="text-xl font-bold text-red-600">{result.totalQuestions - (result.correctAnswers || 0)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Wrong</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-4 text-center">
              <p className="text-sm font-bold text-amber-600">{formatTime(result.timeTaken || 0)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Time Taken</p>
            </div>
          </div>


          <div className="flex gap-4 justify-center">
            <Link
              to="/mock-tests"
              className="px-6 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              Back to Tests
            </Link>
            <button
              onClick={() => {
                setResult(null);
                setAnswers({});
                setCurrentQuestion(0);
                setTimeLeft(test.duration * 60);
              }}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              Retry Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  if (!test || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <AlertCircle className="w-16 h-16 text-amber-500 mb-4 mx-auto" />
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
          No questions available
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
          This test has no questions. Please contact admin or try another test.
        </p>
        <Link
          to="/mock-tests"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Mock Tests
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 mb-6">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/mock-tests"
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </Link>
          <div>
            <h1 className="font-semibold text-slate-800 dark:text-white">
              {test.title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Question {currentQuestion + 1} of {questions.length} • {question?.sectionName || 'General'}
            </p>
          </div>
        </div>


          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            timeLeft < 300 ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-slate-100 dark:bg-slate-700'
          }`}>
            <Clock className="w-5 h-5" />
            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Navigation */}
      <div className="flex gap-2 mb-6 flex-wrap" style={{maxHeight: '200px', overflowY: 'auto'}}>
        {questions.map((q, index) => (
          <button
            key={q._id}
            onClick={() => setCurrentQuestion(index)}
            title={`${q.sectionName || 'Main'} - Q${index+1}`}
            className={`w-10 h-10 rounded-lg font-medium text-xs transition-all flex-shrink-0 ${
              currentQuestion === index
                ? 'bg-primary-500 text-white shadow-md ring-2 ring-primary-200 ring-opacity-50'
            : (answers[q._id]?.length > 0)
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-200'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 hover:shadow-sm border border-slate-200'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>


      {/* Question */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 mb-6">
        {question.sectionName && (
          <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{question.sectionName}</span>
          </div>
        )}
        <div className="flex items-start justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
            {question.difficulty}
          </span>
        </div>

        <h2 className="text-lg font-medium text-slate-800 dark:text-white mb-6">
          {question.question}
        </h2>


        <div className="space-y-3">
{question.options.map((option, index) => {
const isMulti = question.questionType === 'multi';
            const currentAnswer = answers[question._id] || (isMulti ? [] : undefined);
            const isSelected = isMulti ? currentAnswer?.includes(index) || false : currentAnswer === index;
            const isAnswered = isMulti ? currentAnswer?.length > 0 : currentAnswer !== undefined;
            
            return (
              <label key={index} className="w-full cursor-pointer">
                <div 
onClick={() => handleOptionChange(question._id, index, isMulti)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3 option-card ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md selected'
                      : isAnswered
                      ? 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50'
                      : 'border-slate-200 dark:border-slate-600 hover:border-primary-300 hover:bg-slate-50'
                  }`}
                >
                  <input 
type={isMulti ? "checkbox" : "radio"}
                    name={`question-${question._id}`}
                    checked={isSelected}
                    onChange={() => {}} 
                    className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                  />
                  <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 flex-shrink-0 min-w-[2.125rem]">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1 text-slate-700 dark:text-slate-200">{option}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>

        {currentQuestion === questions.length - 1 ? (
          <button
            onClick={() => setShowConfirm(true)}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Flag className="w-5 h-5" />
                Submit Test
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
              Submit Test?
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              You have answered {Object.keys(answers).length} out of {questions.length} questions.
              {Object.keys(answers).length < questions.length && (
                <span className="text-amber-500"> Unanswered questions will be marked as incorrect.</span>
              )}
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                Review Answers
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeTest;

