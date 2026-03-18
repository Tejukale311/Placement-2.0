
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI, questionsAPI, codingAPI } from '../services/api';
import {
  Bookmark,
  Brain,
  Code,
  Trash2,
  Loader2,
  BookOpen,
  ArrowRight
} from 'lucide-react';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState({ aptitude: [], coding: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('aptitude');

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const response = await userAPI.getBookmarks();
      if (response.data.success) {
        // Separate aptitude and coding bookmarks
        const aptitude = response.data.bookmarks.filter(b => 
          b.questionType === 'aptitude' || b.questionType === 'question'
        );
        const coding = response.data.bookmarks.filter(b => 
          b.questionType === 'coding' || b.questionType === 'codingQuestion'
        );
        setBookmarks({ aptitude, coding });
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (bookmarkId) => {
    try {
      await userAPI.removeBookmark({ bookmarkId });
      setBookmarks(prev => ({
        aptitude: prev.aptitude.filter(b => b._id !== bookmarkId),
        coding: prev.coding.filter(b => b._id !== bookmarkId)
      }));
    } catch (error) {
      console.error('Error removing bookmark:', error);
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

  const currentBookmarks = activeTab === 'aptitude' ? bookmarks.aptitude : bookmarks.coding;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          Bookmarks
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Your saved questions for quick access
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('aptitude')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'aptitude'
              ? 'bg-primary-500 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Brain className="w-4 h-4" />
          Aptitude ({bookmarks.aptitude.length})
        </button>
        <button
          onClick={() => setActiveTab('coding')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'coding'
              ? 'bg-primary-500 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Code className="w-4 h-4" />
          Coding ({bookmarks.coding.length})
        </button>
      </div>

      {/* Bookmarks List */}
      {currentBookmarks.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
            No bookmarks yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Start bookmarking questions to access them quickly later
          </p>
          <Link
            to="/aptitude"
            className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600"
          >
            Start Practicing <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {currentBookmarks.map((bookmark) => (
            <div
              key={bookmark._id}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(bookmark.difficulty)}`}>
                      {bookmark.difficulty || 'medium'}
                    </span>
                    {bookmark.category && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {bookmark.category}
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-slate-800 dark:text-white mb-2 line-clamp-2">
                    {bookmark.question?.question || bookmark.title || 'Question'}
                  </h3>
                  {bookmark.question?.options && (
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {bookmark.question.options.length} options
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveBookmark(bookmark._id)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;

