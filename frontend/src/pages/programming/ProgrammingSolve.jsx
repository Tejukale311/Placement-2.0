import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { ArrowLeft, Play, Zap, Loader2, CheckCircle, XCircle, Terminal } from 'lucide-react';

import { programmingAPI } from '../../services/programmingAPI';


const languages = [
  { id: 'javascript', name: 'JavaScript', monaco: 'javascript' },
  { id: 'python', name: 'Python', monaco: 'python' },
  { id: 'java', name: 'Java', monaco: 'java' },
  { id: 'cpp', name: 'C++', monaco: 'cpp' },
  { id: 'sql', name: 'SQL', monaco: 'sql' }
];

const ProgrammingSolve = () => {
  const { section, topic, difficulty, questionId } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    fetchQuestion();
  }, [questionId]);

  const fetchQuestion = async () => {
    setLoading(true);
    try {
      const response = await programmingAPI.getQuestion(questionId);
      setQuestion(response.data.question);
      setCode(response.data.question.starterCode?.[language] || '');
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (question?.starterCode?.[newLang]) {
      setCode(question.starterCode[newLang]);
    }
  };

  const handleRunCode = async () => {
    setRunning(true);
    setOutput('');
    try {
      const response = await programmingAPI.runCode({ 
        sourceCode: code, 
        language, 
        stdin: '' 
      });
      setOutput(response.data.output || response.data.stderr || 'No output');
    } catch (error) {
      setOutput(error.response?.data?.message || 'Error running code');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setRunning(true);
    try {
      const response = await programmingAPI.submitCode({ 
        questionId, 
        sourceCode: code, 
        language 
      });
      setResult(response.data.result);
      setOutput(response.data.output || '');
    } catch (error) {
      setOutput(error.response?.data?.message || 'Error submitting code');
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ArrowLeft className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h2 className="text-2xl font-bold mb-2">Question not found</h2>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Back to Questions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <div className="w-full lg:w-96 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">{question.title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
              {question.topic} • {question.difficulty}
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Description</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{question.description}</p>
          </div>

          {question.inputFormat && (
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Input Format</h3>
              <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                <pre className="text-sm text-slate-700 dark:text-slate-200 font-mono">{question.inputFormat}</pre>
              </div>
            </div>
          )}

          {question.outputFormat && (
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Output Format</h3>
              <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                <pre className="text-sm text-slate-700 dark:text-slate-200 font-mono">{question.outputFormat}</pre>
              </div>
            </div>
          )}

          {question.examples && question.examples.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Examples</h3>
              {question.examples.map((ex, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-700 p-4 mb-4 rounded-xl">
                  <div className="flex gap-4 mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-700 dark:text-slate-200 mb-1">Input:</h4>
                      <pre className="bg-slate-200 dark:bg-slate-600 px-3 py-2 rounded text-xs font-mono text-slate-800 dark:text-slate-200">{ex.input}</pre>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-700 dark:text-slate-200 mb-1">Output:</h4>
                      <pre className="bg-emerald-100 dark:bg-emerald-900/30 px-3 py-2 rounded text-xs font-mono text-emerald-800 dark:text-emerald-200">{ex.output}</pre>
                    </div>
                  </div>
                  {ex.explanation && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 italic">{ex.explanation}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {question.constraints && (
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Constraints</h3>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border-l-4 border-amber-400 dark:border-amber-500">
                <pre className="text-sm text-slate-700 dark:text-slate-200 font-mono whitespace-pre-wrap">{question.constraints}</pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <select 
              value={language} 
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              {languages.map(lang => (
                <option key={lang.id} value={lang.id}>{lang.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleRunCode} 
              disabled={running}
              className="flex items-center gap-2 px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Run
            </button>
            <button 
              onClick={handleSubmit}
              disabled={running}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Submit & Run Tests
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
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
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              padding: { top: 16, bottom: 16 }
            }}
          />
        </div>

        {/* Output */}
        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-900">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Terminal className="w-4 h-4" />
              Output
            </span>
            {result && (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                result.status === 'accepted' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {result.status === 'accepted' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                {result.status}
              </span>
            )}
          </div>
          <div className="h-40 p-4 overflow-auto font-mono text-sm">
            {running ? (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Running your code...
              </div>
            ) : output ? (
              <pre className="whitespace-pre-wrap text-green-400">{output}</pre>
            ) : (
              <p className="text-slate-500">Run your code to see output</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgrammingSolve;

