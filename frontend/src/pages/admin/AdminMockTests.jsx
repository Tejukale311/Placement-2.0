import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI, questionsAPI } from '../../services/api';
import { aptitudeTopics, aptitudeCategories } from '../../data/aptitudeConfig';
import { 
  Plus, Edit, Trash2, X, ToggleLeft, ToggleRight, ChevronLeft,
  Search, Clock, Target, Users, ChevronDown, Filter, BookOpen, 
  Loader2, AlertTriangle, CheckCircle, Minus, Layers, Brain 
} from 'lucide-react';


export default function AdminMockTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: 'General',
    duration: 60,
    difficulty: 'mixed',
    passingPercentage: 35,
    isActive: true,
    sections: []
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSectionIdx, setPickerSectionIdx] = useState(0);
  const [pickerFilters, setPickerFilters] = useState({ category: '', topic: '', difficulty: '', search: '' });
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [sectionPreviews, setSectionPreviews] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });


  useEffect(() => {
    fetchTests();
  }, [pagination.page]);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getMockTests({ page: pagination.page, limit: 12 });
      setTests(res.data.tests || []);
      setPagination({
        page: res.data.currentPage,
        totalPages: res.data.totalPages,
        total: res.data.total
      });
      setError('');
    } catch (err) {
      setError('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingTest(null);
    setFormData({
      title: '',
      description: '',
      company: 'General',
      duration: 60,
      difficulty: 'mixed',
      passingPercentage: 35,
      isActive: true,
      sections: []
    });
    setShowModal(true);
  };

  const openEdit = (test) => {
    setEditingTest(test);
    setFormData({
      title: test.title || '',
      description: test.description || '',
      company: test.company || 'General',
      duration: test.duration || 60,
      difficulty: test.difficulty || 'mixed',
      passingPercentage: test.passingPercentage || 35,
      isActive: test.isActive || true,
      sections: test.sections || []
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingTest) {
        await adminAPI.updateMockTest(editingTest._id, formData);
        setSuccess('Test updated successfully');
      } else {
        await adminAPI.addMockTest(formData);
        setSuccess('Test created successfully');
      }
      setShowModal(false);
      fetchTests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete test?')) return;
    try {
      await adminAPI.deleteMockTest(id);
      setTests(tests.filter(t => t._id !== id));
      setSuccess('Test deleted');
    } catch (err) {
      setError('Delete failed');
    }
  };

  const handleToggle = async (id) => {
    try {
      await adminAPI.toggleMockTest(id);
      setTests(tests.map(t => t._id === id ? {...t, isActive: !t.isActive} : t));
      setSuccess('Status updated');
    } catch (err) {
      setError('Toggle failed');
    }
  };

const addSection = () => {
    const newSectionTime = prompt('Enter time limit for new section (minutes):', formData.duration / 4 || 15);
    const timeLimit = parseInt(newSectionTime) || 15;
    const newSections = [...formData.sections, { name: 'New Section', category: '', questions: [], timeLimit }];
    setFormData({...formData, sections: newSections});
  };



  const deleteSection = (idx) => {
    const newSections = formData.sections.filter((_, i) => i !== idx);
    setFormData({...formData, sections: newSections});
  };

  const updateSection = (idx, field, value) => {
    const newSections = formData.sections.map((s, i) => i === idx ? {...s, [field]: value} : s);
    setFormData({...formData, sections: newSections});
  };

const removeQuestionFromSection = (sectionIdx, qId) => {
    const updatedSection = {
      ...formData.sections[sectionIdx],
      questions: formData.sections[sectionIdx].questions.filter(id => id !== qId)
    };
    const newSections = formData.sections.map((s, i) => i === sectionIdx ? updatedSection : s);
    setFormData({...formData, sections: newSections});
    setSuccess('Question removed');
  };



  const fetchSectionPreview = useCallback(async (sectionQuestions, idx) => {
    if (sectionQuestions.length === 0) {
      setSectionPreviews(prev => ({...prev, [idx]: []}));
      return;
    }
    try {
      const res = await questionsAPI.getAll({ids: sectionQuestions.slice(0,3).join(',')});
      const previews = res.data || [];
      setSectionPreviews(prev => ({...prev, [idx]: previews}));
    } catch {
      setSectionPreviews(prev => ({...prev, [idx]: []}));
    }
  }, []);

  const openQuestionPicker = (sectionIdx) => {
    const sectionQuestions = formData.sections[sectionIdx]?.questions || [];
    setPickerSectionIdx(sectionIdx);
    setSelectedQuestionIds(sectionQuestions);
    setPickerFilters({ 
      category: formData.sections[sectionIdx]?.category || '', 
      topic: '', 
      difficulty: '', 
      search: '' 
    });
    setPickerOpen(true);
    fetchSectionPreview(sectionQuestions, sectionIdx);
  };



  const fetchPickerQuestions = useCallback(async () => {
    setPickerLoading(true);
    setAvailableQuestions([]);
    try {
      const params = {
        category: pickerFilters.category,
        topic: pickerFilters.topic,
        difficulty: pickerFilters.difficulty,
        limit: 100
      };
      console.log('Fetching with params:', params);
      const res = await questionsAPI.getAll(params);
      console.log('Raw API Response:', res);
      let questions = [];
      if (res.data && Array.isArray(res.data)) {
        questions = res.data;
      } else if (res.data && res.data.questions && Array.isArray(res.data.questions)) {
        questions = res.data.questions;
      } else if (res.data && Array.isArray(res.data.data)) {
        questions = res.data.data;
      } else {
        questions = [];
      }
      console.log('Processed questions:', questions.length);
      setAvailableQuestions(questions);
    } catch (err) {
      console.error('Picker API error:', err.response?.data || err);
      setAvailableQuestions([]);
    } finally {
      setPickerLoading(false);
    }
  }, [pickerFilters.category, pickerFilters.topic, pickerFilters.difficulty]);

  useEffect(() => {
    if (pickerOpen) {
      const timer = setTimeout(fetchPickerQuestions, 200);
      return () => clearTimeout(timer);
    }
  }, [fetchPickerQuestions, pickerOpen]);

  const handleFilterChange = (field, value) => {
    setPickerFilters(prev => ({ ...prev, [field]: value }));
  };

  const toggleQuestion = (qId) => {
    setSelectedQuestionIds(prev => 
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  };

  const addQuestionsToSection = () => {
    const currentQuestions = formData.sections[pickerSectionIdx].questions || [];
    const newQuestions = selectedQuestionIds.filter(id => !currentQuestions.includes(id));
    const updatedSection = {
      ...formData.sections[pickerSectionIdx],
      questions: [...currentQuestions, ...newQuestions]
    };
    const newSections = formData.sections.map((s, i) => i === pickerSectionIdx ? updatedSection : s);
    setFormData({...formData, sections: newSections});
    setPickerOpen(false);
    setSuccess('Questions added to section');
  };

  const getTopicsForCategory = (category) => aptitudeTopics[category] || [];

  if (loading && tests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-slate-500">Loading tests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Mock Tests
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Manage section-wise placement preparation tests</p>
        </div>
        <button 
          onClick={openCreate}
          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-3 self-start lg:self-auto"
        >
          <Plus size={20} />
          Create Test
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle size={20} />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-600">
            <X size={16} />
          </button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-start gap-3">
          <CheckCircle size={20} />
          {success}
          <button onClick={() => setSuccess('')} className="ml-auto text-green-500 hover:text-green-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tests.map(test => (
          <div key={test._id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${test.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' : test.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                  <Target size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg line-clamp-1">{test.title}</h3>
                  <p className="text-sm text-slate-500">{test.company}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${test.isActive ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                {test.isActive ? 'Active' : 'Draft'}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{test.description}</p>
            <div className="grid grid-cols-2 gap-3 text-xs mb-6">
              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <Clock size={14} />
                <span>{test.duration} min</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <Users size={14} />
                <span>{test.attempts || 0} attempts</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {test.sections?.slice(0,4).map((s, i) => (
                <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                  {s.name} ({s.questions?.length || 0})
                </span>
              ))}
              {test.sections && test.sections.length > 4 && (
                <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full font-medium">
                  +{test.sections.length - 4} sections
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => openEdit(test)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl text-sm font-semibold transition-colors"
              >
                Edit Test
              </button>
              <button 
                onClick={() => handleToggle(test._id)}
                className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                {test.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button 
                onClick={() => handleDelete(test._id)}
                className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl max-w-7xl">
            <div className="sticky top-0 z-10 p-6 border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white shadow-lg">
                  <Layers size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {editingTest ? 'Edit' : 'Create'} Mock Test
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Build structured mock tests with category-wise sections
                  </p>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="ml-auto p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X size={24} className="text-slate-500" />
                </button>
              </div>
            </div>
            <div className="p-8 overflow-y-auto max-h-[85vh]">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold mb-6 flex items-center gap-3">
                      <Target size={20} className="text-blue-500" />
                      Basic Information
                    </h4>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Test Title *
                        </label>
                        <input 
                          type="text" 
                          required
                          value={formData.title}
                          onChange={(e) => setFormData(p => ({...p, title: e.target.value}))}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Duration (minutes)
                          </label>
                          <input 
                            type="number" 
                            min="15" max="180"
                            value={formData.duration}
                            onChange={(e) => setFormData(p => ({...p, duration: +e.target.value}))}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            required 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Difficulty
                          </label>
                          <select 
                            value={formData.difficulty}
                            onChange={(e) => setFormData(p => ({...p, difficulty: e.target.value}))}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                            <option value="mixed">Mixed</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Company
                        </label>
                        <input 
                          type="text" 
                          value={formData.company}
                          onChange={(e) => setFormData(p => ({...p, company: e.target.value}))}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-6">
                      Test Description
                    </label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData(p => ({...p, description: e.target.value}))}
                      rows="6"
                      placeholder="Describe the test purpose, instructions for students..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white resize-none"
                    />
                  </div>
                </div>

                {/* Sections */}
                <div>
                  <div className="flex items-center gap-4 mb-8">
                    <Layers size={24} className="text-emerald-500" />
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Test Sections</h3>
                      <p className="text-slate-600 dark:text-slate-400">Add category-wise sections for structured testing</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={addSection}
                      className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Add Section
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.sections.map((section, idx) => (
                      <div key={idx} className="bg-gradient-to-r from-slate-50/80 to-slate-100/80 dark:from-slate-800 dark:to-slate-700 p-8 rounded-3xl border-2 border-slate-200/50 dark:border-slate-600/50 hover:shadow-2xl hover:border-slate-300 dark:hover:border-slate-500 transition-all">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white shadow-lg">
                              <Brain size={20} />
                            </div>
                            <div className="flex-1">
                              <input 
                                type="text"
                                value={section.name}
                                onChange={(e) => updateSection(idx, 'name', e.target.value)}
                                placeholder="Section name (Quantitative Aptitude, Verbal Reasoning...)"
                                className="w-full text-2xl font-bold bg-transparent border-none outline-none text-slate-900 dark:text-white"
                              />
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button 
                              type="button"
                              onClick={() => openQuestionPicker(idx)}
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl flex items-center gap-2 transition-all whitespace-nowrap"
                            >
                              <Plus size={18} />
                              Edit Questions
                            </button>
                            <button 
                              type="button"
                              onClick={() => deleteSection(idx)}
                              className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-2xl shadow-lg hover:shadow-xl flex items-center justify-center transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>

                        {/* Section Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-white/60 dark:bg-slate-700/50 rounded-2xl">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">{section.questions?.length || 0}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Questions</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-slate-900 dark:text-white">{section.timeLimit || 0} min</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Time Limit</div>
                          </div>
                          <div className="text-center">
                            <select 
                              value={section.category || ''}
                              onChange={(e) => updateSection(idx, 'category', e.target.value)}
                              className="mt-2 w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            >
                              <option value="">Select Category</option>
                              {aptitudeCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Questions Preview */}
                        {section.questions && section.questions.length > 0 && (
                          <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl border-2 border-emerald-200/50 dark:border-emerald-800/50">
                            <div className="flex items-center gap-3 mb-4">
                              <CheckCircle size={20} className="text-emerald-600" />
                              <h4 className="font-semibold text-slate-900 dark:text-white text-lg">
                                {section.questions.length} Questions Selected
                              </h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                              {section.questions.slice(0,12).map((qId, qIdx) => (
                                <div key={qId} className="p-3 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 text-xs">
                                  <div className="font-mono text-slate-600 dark:text-slate-400 mb-1">Q{qIdx + 1}</div>
                                  <div className="text-slate-500 dark:text-slate-400 truncate">{qId.slice(-8)}</div>
                                  <button 
                                    onClick={() => removeQuestionFromSection(idx, qId)}
                                    className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                              {section.questions.length > 12 && (
                                <div className="col-span-full text-center py-8 text-slate-500 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl">
                                  +{section.questions.length - 12} more questions
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-8 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8 rounded-3xl -mx-8 -mb-8">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 py-4 px-8 rounded-2xl font-semibold text-slate-900 dark:text-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 py-4 px-8 rounded-2xl font-bold text-white shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center gap-3 text-lg"
                  >
                    <CheckCircle size={24} />
                    {editingTest ? 'Update Test' : 'Create Test'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Question Picker Modal */}
      {pickerOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="sticky top-0 z-10 p-6 border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setPickerOpen(false)}
                    className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Select Questions - {formData.sections[pickerSectionIdx]?.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Filter and select questions for this section
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>{selectedQuestionIds.length} selected</span>
                  <div className="h-2 w-2 bg-slate-400 rounded-full"></div>
                  <span>{availableQuestions.length} available</span>
                </div>
              </div>
            </div>
            <div className="p-6 overflow-hidden h-[calc(95vh-120px)]">
              <div className="flex flex-wrap gap-3 mb-8 pb-6 border-b border-slate-200 dark:border-slate-700">
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input 
                    type="text"
                    placeholder="Search by keyword..."
                    value={pickerFilters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-2xl focus:ring-3 focus:ring-blue-500/20 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm shadow-sm"
                  />
                </div>
                <select 
                  value={pickerFilters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-2xl focus:ring-3 focus:ring-blue-500/20 bg-white/80 dark:bg-slate-700/80 shadow-sm min-w-[180px]"
                >
                  <option value="">All Categories</option>
                  {aptitudeCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <select 
                  value={pickerFilters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-2xl focus:ring-3 focus:ring-blue-500/20 bg-white/80 dark:bg-slate-700/80 shadow-sm min-w-[140px]"
                >
                  <option value="">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <button 
                  onClick={fetchPickerQuestions}
                  disabled={pickerLoading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2 min-w-[120px]"
                >
                  <Filter size={18} />
                  {pickerLoading ? 'Loading...' : 'Filter'}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 h-full overflow-hidden">
                <div className="lg:col-span-2 xl:col-span-2 space-y-3 h-full overflow-y-auto pr-2">
                  <h4 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen size={20} />
                    Available Questions ({availableQuestions.length})
                  </h4>
                  {pickerLoading ? (
                    <div className="grid place-items-center h-64">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                        <div>Loading questions...</div>
                      </div>
                    </div>
                  ) : availableQuestions.length === 0 ? (
                    <div className="grid place-items-center h-64 text-slate-500">
                      <BookOpen size={48} className="opacity-30 mb-4" />
                      <div className="text-lg">No questions found</div>
                      <div className="text-sm mt-2">Try different filters</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {availableQuestions.map((q) => (
                        <div key={q._id} className="group p-5 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer hover:shadow-md">
                          <label className="flex items-start gap-4 w-full cursor-pointer">
                            <div className="flex-shrink-0 mt-1">
                              <input 
                                type="checkbox"
                                checked={selectedQuestionIds.includes(q._id)}
                                onChange={(e) => toggleQuestion(q._id)}
                                className="w-6 h-6 text-blue-600 border-2 border-slate-300 rounded focus:ring-blue-500 focus:ring-2 mt-0.5"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 mb-2">{q.question}</div>
                              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                                <span className="font-medium">{q.topic || 'General'}</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${q.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-800' : q.difficulty === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                  {q.difficulty?.charAt(0).toUpperCase() + q.difficulty?.slice(1)}
                                </span>
                              </div>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-4 border-l border-slate-200 dark:border-slate-700 pl-6 h-full">
                  <div>
                    <h4 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                      <CheckCircle size={20} className="text-emerald-500" />
                      To Add ({selectedQuestionIds.length})
                    </h4>
                    {selectedQuestionIds.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center text-slate-500">
                          <CheckCircle size={48} className="mx-auto mb-4 opacity-30" />
                          <div>Select questions to preview here</div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-full overflow-y-auto">
                        {selectedQuestionIds.map((qId, idx) => (
                          <div key={qId} className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                Q{idx + 1}
                              </div>
                              <button 
                                onClick={() => toggleQuestion(qId)}
                                className="p-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-full transition-colors ml-2"
                              >
                                <X size={16} className="text-slate-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={addQuestionsToSection}
                    disabled={selectedQuestionIds.length === 0}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 text-white py-4 px-6 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all sticky bottom-6 z-10 disabled:cursor-not-allowed"
                  >
                    Add {selectedQuestionIds.length} {selectedQuestionIds.length === 1 ? 'Question' : 'Questions'} to Section
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {tests.length === 0 && !loading && (
        <div className="text-center py-32">
          <BookOpen size={80} className="mx-auto mb-8 text-slate-300 dark:text-slate-600" />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">No Mock Tests Yet</h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto">
            Create your first section-based mock test for placement preparation.
          </p>
          <button 
            onClick={openCreate}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all inline-flex items-center gap-3"
          >
            <Plus size={24} />
            Create First Mock Test
          </button>
        </div>
      )}
    </div>
  );
}

