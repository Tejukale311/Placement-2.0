import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';

import { programmingAPI } from '../../services/programmingAPI';

import {
  Code,
  Play,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronRight,
  BookOpen,
  ArrowLeft,
  Folder,
  FileCode,
  Zap,
  Terminal,
  FileText,
  List,
  ArrowRight
} from 'lucide-react';

const languages = [
  { id: 'javascript', name: 'JavaScript', monaco: 'javascript' },
  { id: 'python', name: 'Python', monaco: 'python' },
  { id: 'java', name: 'Java', monaco: 'java' },
  { id: 'cpp', name: 'C++', monaco: 'cpp' },
  { id: 'sql', name: 'SQL', monaco: 'sql' }
];

const categories = [
  { id: 'exercises', name: 'Exercises', icon: Code, gradient: 'from-green-500 to-emerald-500', desc: 'Practice coding problems' },
  { id: 'technical-mcq', name: 'Technical MCQs', icon: BookOpen, gradient: 'from-blue-500 to-cyan-500', desc: 'Programming questions' },
  { id: 'dsa', name: 'DSA Questions', icon: Folder, gradient: 'from-purple-500 to-pink-500', desc: 'Data structures & algorithms' },
  { id: 'interview', name: 'Interview Questions', icon: FileCode, gradient: 'from-orange-500 to-amber-500', desc: 'Common interview queries' }
];

const defaultCode = {
  javascript: `// Write your solution here
function solution(input) {
    // Your code here
    return input;
}

// Test your solution
console.log(solution([1, 2, 3]));`,
  python: `# Write your solution here
def solution(input):
    # Your code here
    return input

# Test your solution
print(solution([1, 2, 3]))`,
  java: `// Write your solution here
public class Solution {
    public static void main(String[] args) {
        // Your code here
    }
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Your code here
    return 0;
}`,
  sql: `-- Write your SQL query here
SELECT * FROM table_name;`
};

const Programming = () => {
  const { type } = useParams();
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    if (type) fetchQuestions();
  }, [type]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await codingAPI.getAll({ category: type, limit: 20 });
      if (response.data.success) setQuestions(response.data.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuestion = (question) => {
    setSelectedQuestion(question);
    setCode(defaultCode[language] || '');
    setOutput('');
    setResult(null);
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(selectedQuestion?.starterCode?.[newLang] || defaultCode[newLang] || '');
  };

  const handleRunCode = async () => {
    setRunning(true);
    setOutput('');
    try {
      const response = await codingAPI.runCode({ sourceCode: code, language, stdin: '' });
      if (response.data.success) setOutput(response.data.output || response.data.stderr || 'No output');
    } catch (error) {
      setOutput(error.response?.data?.message || 'Error running code');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setRunning(true);
    try {
      const response = await codingAPI.submitCode({ codingQuestionId: selectedQuestion._id, sourceCode: code, language });
      if (response.data.success) {
        setResult(response.data.result);
        setOutput(response.data.output || '');
      }
    } catch (error) {
      setOutput(error.response?.data?.message || 'Error submitting code');
    } finally {
      setRunning(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' };
      case 'medium': return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' };
      case 'hard': return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' };
      default: return { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-400' };
    }
  };

  if (!type) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/30">
              <Code className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Programming Practice</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">Choose a category to start coding</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, index) => (
            <Link key={cat.id} to={`/programming/${cat.id}`} className="group card card-hover p-5" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${cat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <cat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 dark:text-white group-hover:text-primary-500 transition-colors">{cat.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{cat.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900">
              <Terminal className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Integrated Code Editor</h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mb-4">Practice coding with our Monaco-based editor supporting JavaScript, Python, Java, C++, and SQL.</p>
          <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm">
            <pre className="text-green-400">{`function solution(arr) {
  return arr.reduce((a, b) => a + b, 0);
}
console.log(solution([1, 2, 3, 4, 5]));
// Output: 15`}</pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-140px)]">
      {/* Questions List */}
      <div className="w-full lg:w-80 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <Link to="/programming" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-3 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to categories
          </Link>
          <h2 className="font-bold text-slate-800 dark:text-white">{categories.find(c => c.id === type)?.name}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{questions.length} problems</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {questions.map((q) => {
                const diffStyle = getDifficultyColor(q.difficulty);
                return (
                  <button key={q._id} onClick={() => handleSelectQuestion(q)} className={`w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all ${selectedQuestion?._id === q._id ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500' : ''}`}>
                    <h3 className="font-medium text-slate-800 dark:text-white text-sm line-clamp-2 mb-2">{q.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${diffStyle.bg} ${diffStyle.text}`}>{q.difficulty}</span>
                      <span className="text-xs text-slate-400">{q.points} pts</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {!selectedQuestion ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                <Code className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Select a problem</h3>
              <p className="text-slate-500 dark:text-slate-400">Choose a problem from the list to start coding</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex border-b border-slate-200 dark:border-slate-700">
              <button onClick={() => setActiveTab('description')} className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'description' ? 'border-primary-500 text-primary-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                <FileText className="w-4 h-4" /> Description
              </button>
              <button onClick={() => setActiveTab('submissions')} className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'submissions' ? 'border-primary-500 text-primary-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                <List className="w-4 h-4" /> Submissions
              </button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {activeTab === 'description' ? (
                <div className="w-full lg:w-1/2 p-5 overflow-y-auto border-b lg:border-b-0 lg:border-r200 dark:border border-slate--slate-700">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">{selectedQuestion.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">{selectedQuestion.description}</p>
                  {selectedQuestion.examples?.length > 0 && (
                    <div className="mb-5">
                      <h4 className="font-semibold text-slate-800 dark:text-white mb-3">Examples</h4>
                      {selectedQuestion.examples.map((ex, i) => (
                        <div key={i} className="bg-slate-100 dark:bg-slate-700/50 rounded-xl p-4 mb-3 text-sm">
                          <p className="text-slate-600 dark:text-slate-300 mb-2"><span className="font-semibold">Input:</span> <code className="bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded">{ex.input}</code></p>
                          <p className="text-slate-600 dark:text-slate-300"><span className="font-semibold">Output:</span> <code className="bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded">{ex.output}</code></p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full lg:w-1/2 p-5 overflow-y-auto"><div className="text-center py-12"><List className="w-12 h-12 mx-auto text-slate-300 mb-3" /><p className="text-slate-500">View your past submissions here</p></div></div>
              )}

              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <select value={language} onChange={(e) => handleLanguageChange(e.target.value)} className="bg-white dark:bg-slate-700 text-slate-800 dark:text-white px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500">
                    {languages.map((lang) => (<option key={lang.id} value={lang.id}>{lang.name}</option>))}
                  </select>
                  <div className="flex gap-2">
                    <button onClick={handleRunCode} disabled={running} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50">
                      <Play className="w-4 h-4" /> Run
                    </button>
                    <button onClick={handleSubmit} disabled={running} className="btn btn-primary btn-sm">
                      {running ? <><Loader2 className="w-4 h-4 animate-spin" /> Running...</> : <><Zap className="w-4 h-4" /> Submit</>}
                    </button>
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                  <Editor height="100%" language={languages.find(l => l.id === language)?.monaco} value={code} onChange={(value) => setCode(value || '')} theme="vs-dark" options={{ minimap: { enabled: false }, fontSize: 14, lineNumbers: 'on', scrollBeyondLastLine: false, automaticLayout: true, tabSize: 2, wordWrap: 'on', padding: { top: 16 } }} />
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 dark:bg-slate-800">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Terminal className="w-4 h-4" /> Output</span>
                    {result && (<span className={`flex items-center gap-1.5 text-sm font-medium ${result.status === 'accepted' ? 'text-success-500' : 'text-danger-500'}`}>{result.status === 'accepted' ? <><CheckCircle className="w-4 h-4" /> Accepted</> : <><XCircle className="w-4 h-4" /> Wrong Answer</>}</span>)}
                  </div>
                  <div className="h-36 p-4 bg-slate-900 overflow-auto">
                    {running ? (<div className="flex items-center gap-2 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /> Running your code...</div>) : (<pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">{output || 'Run your code to see output'}</pre>)}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Programming;

