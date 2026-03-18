import React, { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";
import { aptitudeTopics, aptitudeCategories } from "../../data/aptitudeConfig";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const difficulties = ["easy", "medium", "hard"];

export default function AdminQuestions() {

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [formData, setFormData] = useState({
    category: "quantitative",
    topic: "",
    question: "",
    options: ["", "", "", ""],
    questionType: "single",
    correctAnswers: [],
    difficulty: "medium",
    explanation: ""
  });

  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: ""
  });

  const [formTopicOptions, setFormTopicOptions] = useState([]);

  useEffect(() => {
    if (formData.category && aptitudeTopics[formData.category]) {
      setFormTopicOptions(aptitudeTopics[formData.category]);
    } else {
      setFormTopicOptions([]);
    }
  }, [formData.category]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getQuestions();
      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });

    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 3000);
  };

  const resetForm = () => {
    setFormData({
      category: "quantitative",
      topic: "",
      question: "",
      options: ["", "", "", ""],
      questionType: "single",
      correctAnswers: [],
      difficulty: "medium",
      explanation: ""
    });
  };

const handleSubmit = async (e) => {
    e.preventDefault();

// Validate correct answers selected
    if (!formData.correctAnswers || formData.correctAnswers.length === 0) {
      showNotification("error", "Please select at least one correct answer");
      return;
    }

    try {
      const data = { ...formData, subcategory: formData.category };

      if (editingQuestion) {
        await adminAPI.updateQuestion(editingQuestion._id, data);
        showNotification("success", "Question updated successfully");
      } else {
        await adminAPI.addQuestion(data);
        showNotification("success", "Question added successfully");
      }

      setShowModal(false);
      setEditingQuestion(null);
      resetForm();
      fetchQuestions();
    } catch (error) {
      showNotification("error", "Failed to save question");
    }
  };

  const handleDelete = async (id) => {

    if (!window.confirm("Delete this question?")) return;

    try {
      await adminAPI.deleteQuestion(id);
      showNotification("success", "Question deleted");
      fetchQuestions();
    } catch (error) {
      showNotification("error", "Delete failed");
    }
  };

  const openEdit = (q) => {
    setEditingQuestion(q);

    setFormData({
      category: q.category || "quantitative",
      topic: q.topic || "",
      question: q.question || "",
      options: q.options || ["", "", "", ""],
      questionType: q.questionType || "single",
      correctAnswers: q.correctAnswers || [],
      difficulty: q.difficulty || "medium",
      explanation: q.explanation || ""
    });

    setShowModal(true);
  };

  const getDifficultyColor = (difficulty) => {

    const colors = {
      easy: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      hard: "bg-red-100 text-red-800"
    };

    return colors[difficulty] || "bg-gray-100 text-gray-800";
  };

  return (
    <>
      {/* MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowModal(false);
            setEditingQuestion(null);
            resetForm();
          }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-3xl p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {editingQuestion ? "Edit Question" : "Add Question"}
              </h2>

              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingQuestion(null);
                  resetForm();
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full border p-3 rounded"
              >
                {aptitudeCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
                className="w-full border p-3 rounded"
              >
                <option value="">Select Topic</option>

                {formTopicOptions.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>

              <textarea
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
                placeholder="Enter question"
                rows={4}
                className="w-full border p-3 rounded"
                required
              />

              {/* Question Type Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-2">Question Type</label>
                <select
                  value={formData.questionType}
                  onChange={(e) => {
                    const type = e.target.value;
                    setFormData({ 
                      ...formData, 
                      questionType: type,
                      correctAnswers: type === 'single' ? [] : []
                    });
                  }}
                  className="w-full border p-3 rounded"
                >
                  <option value="single">Single Correct Answer</option>
                  <option value="multi">Multiple Correct Answers</option>
                </select>
              </div>

              {/* Options with Conditional Correct Answer Selectors */}
              <div className="space-y-2">
                {formData.options.map((opt, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded hover:bg-slate-50">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...formData.options];
                        newOptions[index] = e.target.value;
                        setFormData({ ...formData, options: newOptions });
                      }}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 border p-2 rounded"
                      required
                    />
                    <label className="flex items-center gap-2 px-4 py-2 border rounded cursor-pointer hover:bg-indigo-50 transition-colors">
                      {formData.questionType === 'single' ? (
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={formData.correctAnswers.includes(index) && formData.correctAnswers.length === 1}
                          onChange={() => setFormData({ ...formData, correctAnswers: [index] })}
                          className="w-4 h-4 text-indigo-600"
                        />
                      ) : (
                        <input
                          type="checkbox"
                          checked={formData.correctAnswers.includes(index)}
                          onChange={(e) => {
                            const newCorrect = e.target.checked
                              ? [...formData.correctAnswers, index]
                              : formData.correctAnswers.filter(i => i !== index);
                            setFormData({ ...formData, correctAnswers: newCorrect });
                          }}
                          className="w-4 h-4 text-indigo-600"
                        />
                      )}
                      <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                        {formData.questionType === 'single' ? 'Correct' : 'Correct ✓'}
                      </span>
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                {difficulties.map((d) => (
                  <label key={d} className="flex items-center gap-2">
                    <input
                      type="radio"
                      value={d}
                      checked={formData.difficulty === d}
                      onChange={(e) =>
                        setFormData({ ...formData, difficulty: e.target.value })
                      }
                    />
                    {d}
                  </label>
                ))}
              </div>

              <textarea
                value={formData.explanation}
                onChange={(e) =>
                  setFormData({ ...formData, explanation: e.target.value })
                }
                placeholder="Explanation"
                className="w-full border p-3 rounded"
              />

              <div className="flex gap-4">

                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-200 py-3 rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded"
                >
                  {editingQuestion ? "Update Question" : "Add Question"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* MAIN PAGE */}
      <div className="p-6 max-w-7xl mx-auto">

        <div className="flex justify-between mb-8">

          <h1 className="text-3xl font-bold">Aptitude Questions</h1>

          <button
            onClick={() => {
              resetForm();
              setEditingQuestion(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded"
          >
            <Plus size={18} />
            Add Question
          </button>

        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>
                <th className="p-4 text-left">Question</th>
                <th className="p-4">Category</th>
                <th className="p-4">Topic</th>
                <th className="p-4">Correct</th>
                <th className="p-4">Difficulty</th>
                <th className="p-4">Created</th>
                <th className="p-4">Actions</th>
              </tr>

            </thead>

            <tbody>

              {loading && (
                <tr>
                  <td colSpan="6" className="text-center p-10">
                    <Loader2 className="animate-spin mx-auto" />
                  </td>
                </tr>
              )}

              {!loading &&
                questions.map((q) => (
                  <tr key={q._id} className="border-t">

                <td className="p-4 max-w-xs truncate" title={q.question}>{q.question}</td>

                <td className="p-4">{q.category}</td>

                <td className="p-4">{q.topic}</td>

                <td className="p-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {q.correctAnswers.map(i => String.fromCharCode(65 + i)).join(', ')} 
                    {(q.correctAnswers.length > 0 && q.options[q.correctAnswers[0]]) ? 
                      `(${q.options[q.correctAnswers[0]].substring(0, 20)}...)` : 'N/A'}
                  </span>
                </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded ${getDifficultyColor(
                          q.difficulty
                        )}`}
                      >
                        {q.difficulty}
                      </span>
                    </td>

                    <td className="p-4">
                      {q.createdAt
                        ? new Date(q.createdAt).toLocaleDateString()
                        : "-"}
                    </td>

                    <td className="p-4 flex gap-2 justify-end">

                      <button onClick={() => openEdit(q)}>
                        <Edit size={18} />
                      </button>

                      <button onClick={() => handleDelete(q._id)}>
                        <Trash2 size={18} />
                      </button>

                    </td>

                  </tr>
                ))}

            </tbody>

          </table>

        </div>

        {notification.show && (
          <div className="fixed top-5 right-5 bg-green-500 text-white px-5 py-3 rounded shadow-lg flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle />
            ) : (
              <AlertCircle />
            )}
            {notification.message}
          </div>
        )}

      </div>
    </>
  );
}