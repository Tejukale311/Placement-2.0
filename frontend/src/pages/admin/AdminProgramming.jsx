import { useState, useEffect } from 'react';


import { adminProgrammingAPI } from '../../services/programmingAPI';


import { programmingSections, difficulties } from '../../data/programmingConfig';
import { Plus, Edit, Trash2, X, Loader2, Search } from 'lucide-react';

export default function AdminProgramming() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    section: '',
    topic: '',
    difficulty: '',
    search: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    section: '',
    topic: '',
    difficulty: 'intermediate',
    title: '',
    description: '',
    problemStatement: '',
    inputFormat: '',
    outputFormat: '',
    exampleInput: '',
    exampleOutput: '',
    constraints: '',
    languages: ['javascript', 'python'],
    starterCode: {},
    testCases: [{ input: '', output: '' }],
    isActive: true,
    points: 10
  });
  const [availableTopics, setAvailableTopics] = useState([]);

  useEffect(() => {
    fetchQuestions();
  }, [filters]);


  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = { ...filters };

const res = await adminProgrammingAPI.getAll(params);

      setQuestions(res.data.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleSectionChange = (sectionId) => {
    setFilters({ ...filters, section: sectionId, topic: '' });
    setFormData({ ...formData, section: sectionId, topic: '' });
    setAvailableTopics(getTopicsBySection(sectionId));
  };

  const getTopicsBySection = (sectionId) => {
    const section = programmingSections.find(s => s.id === sectionId);
    return section ? section.topics : [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Map form data to schema
      const submitData = {
        ...formData,
        examples: formData.exampleInput && formData.exampleOutput ? [{
          input: formData.exampleInput,
          output: formData.exampleOutput
        }] : [],
        problemStatement: formData.problemStatement || formData.description
      };
      delete submitData.exampleInput;
      delete submitData.exampleOutput;

      if (editingQuestion) {
        await adminProgrammingAPI.updateQuestion(editingQuestion._id, submitData);
      } else {
        await adminProgrammingAPI.addQuestion(submitData);
      }
      setShowModal(false);
      setEditingQuestion(null);
      setFormData({
        section: '',
        topic: '',
        difficulty: 'intermediate',
        title: '',
        description: '',
        problemStatement: '',
        inputFormat: '',
        outputFormat: '',
        exampleInput: '',
        exampleOutput: '',
        constraints: '',
        languages: ['javascript', 'python'],
        starterCode: {},
        testCases: [{ input: '', output: '' }],
        isActive: true,
        points: 10
      });
      fetchQuestions();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving question');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this programming question?')) {
      try {
        await adminProgrammingAPI.deleteQuestion(id);
        fetchQuestions();
      } catch (error) {
        alert('Error deleting question');
      }
    }
  };

  const handleToggle = async (id, isActive) => {
    try {
      await adminProgrammingAPI.toggleQuestion(id);
      fetchQuestions();
    } catch (error) {
      alert('Error toggling status');
    }
  };

  const openEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      section: question.section,
      topic: question.topic,
      difficulty: question.difficulty,
      title: question.title,
      description: question.description,
      problemStatement: question.problemStatement || question.description || '',
      inputFormat: question.inputFormat || '',
      outputFormat: question.outputFormat || '',
      exampleInput: question.examples?.[0]?.input || '',
      exampleOutput: question.examples?.[0]?.output || '',
      constraints: question.constraints || '',
      languages: question.languages || ['javascript'],
      starterCode: question.starterCode || {},
      testCases: question.testCases || [{ input: '', output: '' }],
      isActive: question.isActive || true,
      points: question.points || 10
    });
    setAvailableTopics(getTopicsBySection(question.section));
    setShowModal(true);
  };

  const getDifficultyBadge = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[difficulty] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
  };

  const getSectionName = (sectionId) => {
    const section = programmingSections.find(s => s.id === sectionId);
    return section ? section.name : sectionId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Programming Questions</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage questions by section, topic and difficulty</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-medium"
        >
          <Plus size={18} />
          Add Question
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Section</label>
            <select 
              value={filters.section}
              onChange={(e) => handleSectionChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Sections</option>
              {programmingSections.map(section => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Topic</label>
            <select 
              value={filters.topic}
              onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
              disabled={!filters.section}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="">All Topics</option>
              {availableTopics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Difficulty</label>
            <select 
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Levels</option>
              {difficulties.map(diff => (
                <option key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search questions..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Section</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Topic</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Difficulty</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto h-8 w-8 text-indigo-500" />
                    <p className="mt-2 text-slate-500">Loading questions...</p>
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No programming questions found
                  </td>
                </tr>
              ) : (
                questions.map((question) => (
                  <tr key={question._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-xs">
                        {question.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 rounded-full">
                        {getSectionName(question.section)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {question.topic}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyBadge(question.difficulty)}`}>
                        {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggle(question._id, question.isActive)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          question.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-400' 
                            : 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-400'
                        }`}
                      >
                        {question.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => openEdit(question)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(question._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {editingQuestion ? 'Edit Programming Question' : 'Add New Programming Question'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.section}
                    onChange={(e) => handleSectionChange(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Section</option>
                    {programmingSections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                    Topic <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    disabled={!formData.section}
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Topic</option>
                    {availableTopics.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                    Difficulty <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Difficulty</option>
                    {difficulties.map((diff) => (
                      <option key={diff} value={diff}>
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

<div>
                  <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                    Question Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter question title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                    Problem Statement
                  </label>
                  <textarea
                    value={formData.problemStatement}
                    onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Detailed problem statement..."
                  />
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                    Input Format
                  </label>
                  <textarea
                    value={formData.inputFormat}
                    onChange={(e) => setFormData({ ...formData, inputFormat: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe input format..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                    Output Format
                  </label>
                  <textarea
                    value={formData.outputFormat}
                    onChange={(e) => setFormData({ ...formData, outputFormat: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Describe output format..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                    Example Input
                  </label>
                  <textarea
                    value={formData.exampleInput}
                    onChange={(e) => setFormData({ ...formData, exampleInput: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                    placeholder="Example input..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                    Example Output
                  </label>
                  <textarea
                    value={formData.exampleOutput}
                    onChange={(e) => setFormData({ ...formData, exampleOutput: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                    placeholder="Example output..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                  Constraints
                </label>
                <textarea
                  value={formData.constraints}
                  onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Time complexity, space complexity, input size limits..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Languages</label>
                  <div className="space-y-2">
                    {['javascript', 'python', 'java', 'cpp', 'kotlin', 'go', 'rust', 'typescript'].map((lang) => (
                      <label key={lang} className="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.languages.includes(lang)}
                          onChange={(e) => {
                            const newLanguages = e.target.checked 
                              ? [...formData.languages, lang] 
                              : formData.languages.filter(l => l !== lang);
                            setFormData({ ...formData, languages: newLanguages });
                          }}
                          className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium">{lang.charAt(0).toUpperCase() + lang.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Test Cases</label>
                  <div className="space-y-2">
                    {formData.testCases.map((testCase, index) => (
                      <div key={index} className="flex gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <input
                          type="text"
                          value={testCase.input}
                          onChange={(e) => {
                            const newTestCases = [...formData.testCases];
                            newTestCases[index].input = e.target.value;
                            setFormData({ ...formData, testCases: newTestCases });
                          }}
                          placeholder="Input"
                          className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 focus:ring-indigo-500"
                        />
                        <input
                          type="text"
                          value={testCase.output}
                          onChange={(e) => {
                            const newTestCases = [...formData.testCases];
                            newTestCases[index].output = e.target.value;
                            setFormData({ ...formData, testCases: newTestCases });
                          }}
                          placeholder="Expected Output"
                          className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newTestCases = formData.testCases.filter((_, i) => i !== index);
                            setFormData({ ...formData, testCases: newTestCases });
                          }}
                          className="p-2 text-red-500 hover:bg-red-100 rounded hover:text-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, testCases: [...formData.testCases, { input: '', output: '' }] })}
                      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm p-2 hover:bg-indigo-50 rounded"
                    >
                      + Add Test Case
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  {editingQuestion ? 'Update Question' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

