import { useState, useEffect } from 'react';
import { adminAPI, companiesAPI } from '../../services/api';
import { Plus, Edit, Trash2, X, Building2, BookOpen, Code, MessageCircle, ChevronRight } from 'lucide-react';

const defaultCompanies = ['TCS', 'Infosys', 'Wipro', 'Accenture', 'Capgemini', 'Amazon', 'Google', 'Microsoft', 'Meta', 'Netflix', 'Apple', 'IBM', 'Adobe', 'Oracle', 'Cognizant', 'Tech Mahindra'];

export default function AdminCompanyQuestions() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [filters, setFilters] = useState({ search: '' });
  const [formData, setFormData] = useState({ company: '', description: '', logo: '' });
  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    answer: 0,
    difficulty: 'medium',
    type: 'mcq',
    topic: ''
  });

  useEffect(() => { fetchCompanies(); }, [pagination.page, filters]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: 20, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await adminAPI.getCompanyQuestions(params);
      setCompanies(res.data.companies);
      setPagination({ page: res.data.currentPage, totalPages: res.data.totalPages, total: res.data.total });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        await adminAPI.updateCompany(editingCompany._id, formData);
      } else {
        await adminAPI.addCompany(formData);
      }
      setShowModal(false);
      setEditingCompany(null);
      fetchCompanies();
    } catch (e) { alert(e.response?.data?.message || 'Error saving company'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this company?')) {
      try {
        await adminAPI.deleteCompany(id);
        fetchCompanies();
      } catch (e) { alert('Error deleting company'); }
    }
  };

  const openEdit = (c) => {
    setEditingCompany(c);
    setFormData({ company: c.company, description: c.description || '', logo: c.logo || '' });
    setShowModal(true);
  };

  const openAddQuestion = async (company) => {
    setSelectedCompany(company);
    setEditingQuestion(null);
    setQuestionForm({
      question: '',
      options: ['', '', '', ''],
      answer: 0,
      difficulty: 'medium',
      type: 'mcq',
      topic: ''
    });
    setShowQuestionModal(true);
  };

  const openEditQuestion = async (question, index) => {
    setSelectedCompany(selectedCompany);
    setEditingQuestion({ ...question, index });
    setQuestionForm({
      question: question.question,
      options: question.options?.length > 0 ? question.options : ['', '', '', ''],
      answer: question.answer || 0,
      difficulty: question.difficulty || 'medium',
      type: question.type || 'mcq',
      topic: question.topic || ''
    });
    setShowQuestionModal(true);
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingQuestion) {
        // Update question through company controller
        await companiesAPI.updateQuestion(selectedCompany._id, editingQuestion._id, questionForm);
      } else {
        // Add new question
        await companiesAPI.addQuestion(selectedCompany._id, questionForm);
      }
      setShowQuestionModal(false);
      setEditingQuestion(null);
      fetchCompanies();
    } catch (e) { 
      console.error(e);
      alert(e.response?.data?.message || 'Error saving question'); 
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Delete this question?')) {
      try {
        await companiesAPI.deleteQuestion(selectedCompany._id, questionId);
        fetchCompanies();
      } catch (e) { alert('Error deleting question'); }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Company Questions</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage company-specific interview questions</p>
        </div>
        <button onClick={() => { setEditingCompany(null); setFormData({ company: '', description: '', logo: '' }); setShowModal(true); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
          <Plus size={18} /> Add Company
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
        <input type="text" placeholder="Search companies..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 animate-pulse"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div><div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div></div>)
        ) : companies.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No companies found. Add a company to get started.</p>
          </div>
        ) : (
          companies.map(c => (
            <div key={c._id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{c.company}</h3>
                    <p className="text-sm text-slate-500">{c.totalQuestions || 0} MCQs</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(c._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 line-clamp-2">{c.description || 'No description'}</p>
              <div className="flex gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{c.questions?.length || 0}</p>
                  <p className="text-xs text-slate-500">Questions</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{c.codingProblems?.length || 0}</p>
                  <p className="text-xs text-slate-500">Coding</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{c.interviewQuestions?.length || 0}</p>
                  <p className="text-xs text-slate-500">Interview</p>
                </div>
              </div>
              <button 
                onClick={() => openAddQuestion(c)}
                className="w-full mt-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add Questions
              </button>
            </div>
          ))
        )}
      </div>

      {/* Company Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingCompany ? 'Edit Company' : 'Add Company'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name</label>
                <select value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" required>
                  <option value="">Select Company</option>
                  {defaultCompanies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" rows={3} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{editingCompany ? 'Update' : 'Add'} Company</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {showQuestionModal && selectedCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingQuestion ? 'Edit Question' : `Add Question - ${selectedCompany.company}`}</h2>
              <button onClick={() => setShowQuestionModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleQuestionSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Question Type</label>
                <select value={questionForm.type} onChange={(e) => setQuestionForm({ ...questionForm, type: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700">
                  <option value="mcq">MCQ</option>
                  <option value="coding">Coding</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Question</label>
                <textarea value={questionForm.question} onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" rows={3} required />
              </div>
              
              {questionForm.type === 'mcq' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Options</label>
                    {questionForm.options.map((opt, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input 
                          type="radio" 
                          name="answer" 
                          checked={questionForm.answer === i}
                          onChange={() => setQuestionForm({ ...questionForm, answer: i })}
                          className="mt-3"
                        />
                        <input 
                          type="text" 
                          value={opt} 
                          onChange={(e) => {
                            const newOpts = [...questionForm.options];
                            newOpts[i] = e.target.value;
                            setQuestionForm({ ...questionForm, options: newOpts });
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + i)}`}
                          className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <select value={questionForm.difficulty} onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Topic</label>
                  <input type="text" value={questionForm.topic} onChange={(e) => setQuestionForm({ ...questionForm, topic: e.target.value })} placeholder="e.g., Arrays, Strings" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowQuestionModal(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{editingQuestion ? 'Update' : 'Add'} Question</button>
              </div>
            </form>

            {/* Existing Questions List */}
            {selectedCompany.questions?.length > 0 && (
              <div className="p-6 border-t border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold mb-4">Existing Questions ({selectedCompany.questions.length})</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedCompany.questions.map((q, i) => (
                    <div key={i} className="flex items-start justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-2">{q.question}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-600 rounded">{q.type}</span>
                          <span className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-600 rounded">{q.difficulty}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button onClick={() => openEditQuestion(q, i)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={14} /></button>
                        <button onClick={() => handleDeleteQuestion(q._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

