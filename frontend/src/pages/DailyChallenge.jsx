import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { codingAPI } from '../services/api';
import { programmingLanguages, getProgrammingCodeTemplate } from '../data/programmingLanguages.js';
import {
  Trophy,
  Loader2,
  Play,
  CheckCircle,
  XCircle,
  ArrowRight,
  Star,
  Flame
} from 'lucide-react';

const DailyChallenge = () => {
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);

  // Safe language/template access
  const languages = Array.isArray(programmingLanguages) ? programmingLanguages : [];
  const safeGetTemplate = (langId) => {
    try {
      return getProgrammingCodeTemplate(langId);
    } catch {
      return '// Write your solution here';
    }
  };

  // Load template on language change
  useEffect(() => {
    setCode(challenge?.starterCode?.[language] || safeGetTemplate(language));
  }, [language, challenge]);

  useEffect(() => {
    fetchDailyChallenge();
  }, []);

  const fetchDailyChallenge = async () => {
    try {
      const response = await codingAPI.getDaily();
      if (response.data.success) {
        setChallenge(response.data.question);
        setPoints(response.data.points || 10);
      }
    } catch (error) {
      console.error('Daily challenge fetch error:', error);
      setChallenge({
        title: 'Practice Challenge',
        description: 'Test your setup by writing any code.',
        difficulty: 'easy',
        points: 10
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
  };

  const handleRunCode = async () => {
    console.log('Run clicked');
    setRunning(true);
    setOutput('');

    try {
      const response = await codingAPI.runCode({
        sourceCode: code,
        language,
        stdin: ''
      });
      const { stdout, stderr, compile_output } = response.data;
      
      if (compile_output?.trim()) {
        setOutput(compile_output);
      } else if (stderr?.trim()) {
        setOutput(stderr);
      } else if (stdout) {
        setOutput(stdout);
      } else {
        setOutput('Executed successfully');
      }
    } catch (error) {
      console.error('Run error:', error);
      setOutput('Run error: ' + (error.message || 'Unknown error'));
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    console.log('Submit clicked');
    setRunning(true);
    
    try {
      const response = await codingAPI.submitCode({
        codingQuestionId: challenge?._id || 'practice',
        sourceCode: code,
        language
      });
      setResult(response.data);
      if (response.data.isCorrect) {
        setStreak(prev => prev + 1);
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setRunning(false);
    }
  };

  const getDifficultyColor = (difficulty) => ({
    easy: 'text-emerald-500 bg-emerald-100',
    medium: 'text-amber-500 bg-amber-100',
    hard: 'text-red-500 bg-red-100'
  })[difficulty] || 'text-slate-500 bg-slate-100';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent">
              Daily Challenge
            </h1>
            <p className="text-slate-500">Solve today's problem</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-orange-500 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg">
            <Flame className="w-5 h-5" /> {streak} streak
          </div>
          <div className="px-4 py-2 bg-amber-500 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg">
            <Star className="w-5 h-5" /> +{points}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Problem Panel */}
        <div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border p-8 shadow-xl min-h-[400px]">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold">{challenge?.title}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(challenge?.difficulty)}`}>
                {challenge?.difficulty?.toUpperCase()}
              </span>
            </div>
            <div className="prose max-w-none">
              <p className="text-lg mb-6">{challenge?.description}</p>
              {challenge?.examples?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold mb-4">Examples</h3>
                  {challenge.examples.map((ex, i) => (
                    <div key={i} className="grid md:grid-cols-2 gap-4 p-4 mb-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div>
                        <h4 className="font-semibold mb-2">Input:</h4>
                        <pre className="bg-slate-100 p-3 rounded font-mono text-sm">{ex.input}</pre>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Expected:</h4>
                        <pre className="bg-emerald-50 p-3 rounded font-mono text-sm border-l-4 border-emerald-400">{ex.output}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {challenge?.constraints && (
                <div className="bg-amber-50 p-4 rounded-xl border-l-4 border-amber-400">
                  <h3 className="font-bold mb-2">Constraints</h3>
                  <pre className="font-mono text-sm whitespace-pre-wrap">{challenge.constraints}</pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Editor Panel */}
        <div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border shadow-xl overflow-hidden">
            {/* Controls */}
            <div className="p-6 border-b bg-slate-50">
              <div className="flex items-center justify-between">
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="px-4 py-2 bg-white border rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {languages.map(lang => (
                    <option key={lang.id} value={lang.id}>{lang.name}</option>
                  ))}
                </select>
                <div className="flex gap-3">
                  <button
                    onClick={handleRunCode}
                    disabled={running}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all disabled:opacity-50"
                  >
                    {running ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    Run
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={running}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50"
                  >
                    {running ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Submit
                  </button>
                </div>
              </div>
            </div>

            {/* Editor */}
            <div className="h-[500px]">
              <Editor
                height="100%"
                language={languages.find(l => l.id === language)?.monaco || 'javascript'}
                value={code}
                onChange={setCode}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 15,
                  lineNumbers: 'on',
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on'
                }}
              />
            </div>

            {/* Output */}
            <div className="border-t bg-slate-900">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-800">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Terminal
                </span>
                {result && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                    result.isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {result.isCorrect ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {result.score || 0}/{points}
                  </span>
                )}
              </div>
              <div className="h-32 p-4 overflow-auto font-mono text-sm text-green-400 bg-slate-900">
                {running ? (
                  <div className="flex items-center gap-3 text-emerald-400 animate-pulse">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                    <span>Running code... (timeout 2s)</span>
                  </div>
                ) : output ? (
                  <pre className="whitespace-pre-wrap">{output}</pre>
                ) : (
                  <span className="text-slate-500 italic">Click Run to see output</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyChallenge;

