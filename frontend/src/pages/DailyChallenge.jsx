
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { codingAPI, userAPI } from '../services/api';
import {
  Trophy,
  Code,
  Clock,
  Loader2,
  Play,
  CheckCircle,
  XCircle,
  ArrowRight,
  Star,
  Calendar,
  Flame
} from 'lucide-react';

const languages = [
  { id: 'javascript', name: 'JavaScript', monaco: 'javascript' },
  { id: 'python', name: 'Python', monaco: 'python' },
  { id: 'java', name: 'Java', monaco: 'java' },
  { id: 'cpp', name: 'C++', monaco: 'cpp' }
];

const defaultCode = {
  javascript: `// Daily Challenge Solution
function solution(input) {
    // Write your code here
    return input;
}

// Test your solution
console.log(solution([1, 2, 3]));`,
  python: `# Daily Challenge Solution
def solution(input):
    # Write your code here
    return input

# Test your solution
print(solution([1, 2, 3]))`,
  java: `// Daily Challenge Solution
public class Solution {
    public static void main(String[] args) {
        // Write your code here
    }
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    return 0;
}`
};

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

  useEffect(() => {
    fetchDailyChallenge();
  }, []);

  const fetchDailyChallenge = async () => {
    try {
      const response = await codingAPI.getDaily();
      if (response.data.success) {
        setChallenge(response.data.question);
        setCode(defaultCode[language] || '');
        setPoints(response.data.points || 10);
      }
    } catch (error) {
      console.error('Error fetching daily challenge:', error);
      // If no daily challenge, create a fallback
      setChallenge({
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        examples: [
          { input: '[2,7,11,15], 9', output: '[0,1]' },
          { input: '[3,2,4], 6', output: '[1,2]' }
        ],
        constraints: '2 <= nums.length <= 10^4',
        difficulty: 'easy',
        points: 10
      });
      setCode(defaultCode[language] || '');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(defaultCode[newLang] || '');
  };

  const handleRunCode = async () => {
    setRunning(true);
    setOutput('');
    try {
      const response = await codingAPI.runCode({
        sourceCode: code,
        language: language,
        stdin: ''
      });
      
      if (response.data.success) {
        const { output, stderr, compile_output, statusDescription } = response.data;
        
        // Check for compile errors first
        if (compile_output && compile_output.trim()) {
          setOutput(`Compilation Error:\n${compile_output}`);
        }
        // Check for runtime errors
        else if (stderr) {
          setOutput(`Error:\n${stderr}`);
        }
        // Check for successful output
        else if (output) {
          setOutput(output);
        } else {
          // Check status description for better error message
          if (statusDescription) {
            if (statusDescription.toLowerCase().includes('accepted')) {
              setOutput('Code executed successfully (no output produced)');
            } else {
              setOutput(`Status: ${statusDescription}`);
            }
          } else {
            setOutput('No output');
          }
        }
      } else {
        setOutput(response.data.message || 'Error running code');
      }
    } catch (error) {
      setOutput(error.response?.data?.message || 'Error running code');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setRunning(true);
    setSubmitted(true);
    try {
      const response = await codingAPI.submitCode({
        codingQuestionId: challenge?._id,
        sourceCode: code,
        language: language
      });
      
      if (response.data.success) {
        setResult(response.data.result);
        setOutput(response.data.output || '');
        
        if (response.data.result?.status === 'accepted') {
          // Award points for solving
          setStreak(prev => prev + 1);
        }
      }
    } catch (error) {
      setOutput(error.response?.data?.message || 'Error submitting code');
    } finally {
      setRunning(false);
    }
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

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                  Daily Challenge
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                  Solve today's problem to earn points!
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-bold text-orange-600">{streak} day streak</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Star className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-amber-600">+{points} points</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problem Description */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800 dark:text-white">
                {challenge?.title || 'Problem of the Day'}
              </h2>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge?.difficulty)}`}>
                {challenge?.difficulty || 'easy'}
              </span>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              {challenge?.description || 'Complete the daily challenge to earn bonus points and maintain your streak!'}
            </p>

            {challenge?.examples?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-slate-800 dark:text-white mb-3">Examples</h3>
                {challenge.examples.map((ex, i) => (
                  <div key={i} className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 mb-3">
                    <p className="text-sm text-slate-600 dark:text-slate-300"><strong>Input:</strong> {ex.input}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300"><strong>Output:</strong> {ex.output}</p>
                    {ex.explanation && (
                      <p className="text-sm text-slate-500 mt-1"><strong>Explanation:</strong> {ex.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {challenge?.constraints && (
              <div>
                <h3 className="font-medium text-slate-800 dark:text-white mb-2">Constraints</h3>
                <pre className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3 text-sm text-slate-600 dark:text-slate-300">
                  {challenge.constraints}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Code Editor */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col" style={{ height: '600px' }}>
          {/* Language Selector */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white px-3 py-1.5 rounded-lg text-sm border-none outline-none"
            >
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>{lang.name}</option>
              ))}
            </select>
            
            <div className="flex gap-2">
              <button
                onClick={handleRunCode}
                disabled={running}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                Run
              </button>
              <button
                onClick={handleSubmit}
                disabled={running || submitted}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Submit
              </button>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1">
            <Editor
              height="100%"
              language={languages.find(l => l.id === language)?.monaco}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on'
              }}
            />
          </div>

          {/* Output */}
          <div className="border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-700">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Output</span>
              {result && (
                <span className={`flex items-center gap-1 text-sm ${result.status === 'accepted' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {result.status === 'accepted' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  {result.status === 'accepted' ? 'Accepted!' : 'Try Again'}
                </span>
              )}
            </div>
            <div className="h-32 p-4 bg-slate-900 overflow-auto">
              {running ? (
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running...
                </div>
              ) : (
                <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                  {output || 'Run your code to see output'}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {result?.status === 'accepted' && (
        <div className="mt-6 p-6 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <Trophy className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
                Congratulations! 🎉
              </h3>
              <p className="text-emerald-600 dark:text-emerald-400">
                You solved today's challenge and earned {points} points!
              </p>
            </div>
            <Link
              to="/leaderboard"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
            >
              View Leaderboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyChallenge;

