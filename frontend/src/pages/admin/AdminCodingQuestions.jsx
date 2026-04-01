import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Plus, Edit, Trash2, X } from 'lucide-react';

const categories = ['arrays', 'strings', 'linked-lists', 'trees', 'graphs', 'dynamic-programming', 'sorting', 'searching', 'mathematics', 'general'];
const difficulties = ['easy', 'medium', 'hard'];
const languages = ['javascript', 'python', 'java', 'cpp', 'c', 'sql', 'kotlin', 'go', 'rust', 'typescript'];

export default function AdminCodingQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [filters, setFilters] = useState({ category: '', difficulty: '', search: '' });
  const [formData, setFormData] = useState({
    title: '', description: '', problemStatement: '', inputFormat: '', outputFormat: '', constraints: '',
    difficulty: 'medium', category: 'general', language: ['javascript', 'python'], tags: [],
    testCases: [{ input: '', output: '' }],
    starterCode: { javascript: '', python: '', java: '', cpp: '', c: '', sql: '' }
  });

  useEffect(() => { fetchQuestions(); }, [pagination.page, filters]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: 20, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await adminAPI.getCodingQuestions(params);
      setQuestions(res.data.questions);
      setPagination({ page: res.data.currentPage, totalPages: res.data.totalPages, total: res.data.total });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingQuestion) {
        await adminAPI.updateCodingQuestion(editingQuestion._id, formData);
      } else {
        await adminAPI.addCodingQuestion(formData);
      }
      setShowModal(false);
      setEditingQuestion(null);
      fetchQuestions();
    } catch (e) { alert(e.response?.data?.message || 'Error saving question'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this coding question?')) {
      try {
        await adminAPI.deleteCodingQuestion(id);
        fetchQuestions();
      } catch (e) { alert('Error deleting question'); }
    }
  };

  const openEdit = (q) => {
    setEditingQuestion(q);
    setFormData({
      title: q.title, description: q.description || '', problemStatement: q.problemStatement || '',
      inputFormat: q.inputFormat || '', outputFormat: q.outputFormat || '', constraints: q.constraints || '',
      difficulty: q.difficulty, category: q.category || 'general', language: q.language || [],
      tags: q.tags || [], testCases: q.testCases || [{ input: '', output: '' }],
      starterCode: q.starterCode || {}
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Coding Problems</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage coding challenges</p>
        </div>
        <button onClick={() => { setEditingQuestion(null); setShowModal(true); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
          <Plus size={18} /> Add Problem
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap gap-4">
          <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.difficulty} onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })} className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700">
            <option value="">All Difficulties</option>
            {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <div className="flex-1 min-w-[200px]">
            <input type="text" placeholder="Search problems..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Difficulty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Languages</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mx-auto"></div></td></tr>
              ) : questions.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">No coding problems found</td></tr>
              ) : (
                questions.map(q => (
                  <tr key={q._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4"><p className="font-medium text-slate-800 dark:text-slate-100">{q.title}</p></td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{q.category}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${q.difficulty === 'easy' ? 'bg-green-100 text-green-800' : q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{q.difficulty}</span>
                    </td>
                    <td className="px-6 py-4"><div className="flex flex-wrap gap-1">{q.language?.slice(0, 3).map(l => <span key={l} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">{l}</span>)}</div></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(q)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(q._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingQuestion ? 'Edit Problem' : 'Add New Problem'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Title</label><input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" required /></div>
                <div><label className="block text-sm font-medium mb-1">Category</label><select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700">{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Problem Statement</label><textarea value={formData.problemStatement} onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" rows={4} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Input Format</label><input type="text" value={formData.inputFormat} onChange={(e) => setFormData({ ...formData, inputFormat: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" /></div>
                <div><label className="block text-sm font-medium mb-1">Output Format</label><input type="text" value={formData.outputFormat} onChange={(e) => setFormData({ ...formData, outputFormat: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Constraints</label><input type="text" value={formData.constraints} onChange={(e) => setFormData({ ...formData, constraints: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" /></div>
              <div><label className="block text-sm font-medium mb-1">Difficulty</label><select value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700">{difficulties.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
              <div>
                <label className="block text-sm font-medium mb-1">Languages</label>
                <div className="flex flex-wrap gap-2">
                  {languages.map(l => (
                    <label key={l} className="flex items-center gap-2">
                      <input type="checkbox" checked={formData.language.includes(l)} onChange={(e) => { const langs = e.target.checked ? [...formData.language, l] : formData.language.filter(x => x !== l); setFormData({ ...formData, language: langs }); }} className="rounded" />
                      <span className="text-sm">{l}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{editingQuestion ? 'Update' : 'Add'} Problem</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

