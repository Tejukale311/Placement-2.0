import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import {
  Download,
  Plus,
  Trash2,
  Save,
  Loader2,
  Briefcase,
  GraduationCap,
  Code,
  Projector
} from 'lucide-react';

const ResumeBuilder = () => {
  const { user } = useAuth();
  const resumeRef = useRef();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    summary: '',
    education: user?.education || [{
      institution: '',
      degree: '',
      field: '',
      startYear: '',
      endYear: '',
      percentage: ''
    }],
    skills: user?.skills || [],
    projects: user?.projects || [{
      title: '',
      description: '',
      technologies: '',
      link: ''
    }],
    experience: user?.experience || [{
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: ''
    }]
  });

  const [newSkill, setNewSkill] = useState('');

  const handleChange = (e, index, section) => {
    const { name, value } = e.target;
    
    if (section) {
      const updated = [...formData[section]];
      updated[index][name] = value;
      setFormData({ ...formData, [section]: updated });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addItem = (section) => {
    const newItem = section === 'skills' ? '' : {
      institution: '', degree: '', field: '', startYear: '', endYear: '', percentage: '',
      title: '', projectdescription: '', technologies: '', link: '',
      company: '', position: '', startDate: '', endDate: '', jobdescription: ''
    };
    setFormData({ ...formData, [section]: [...formData[section], newItem] });
  };

  const removeItem = (section, index) => {
    const updated = formData[section].filter((_, i) => i !== index);
    setFormData({ ...formData, [section]: updated });
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    const updated = formData.skills.filter((_, i) => i !== index);
    setFormData({ ...formData, skills: updated });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await userAPI.updateProfile(formData);
      alert('Resume saved successfully!');
    } catch (error) {
      console.error('Error saving resume:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    setLoading(true);
    const element = resumeRef.current;
    
    setTimeout(() => {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>${formData.name || 'Resume'}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 20px; }
              .name { font-size: 24px; font-weight: bold; }
              .contact { color: #666; margin-top: 5px; }
              .section { margin-bottom: 20px; }
              .section-title { font-size: 16px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; }
              .item { margin-bottom: 10px; }
              .item-header { display: flex; justify-content: space-between; }
              .item-title { font-weight: bold; }
              .skills { display: flex; flex-wrap: wrap; gap: 5px; }
              .skill { background: #f0f0f0; padding: 3px 8px; border-radius: 3px; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="name">${formData.name || 'Your Name'}</div>
              <div class="contact">${formData.email || ''} ${formData.phone ? '| ' + formData.phone : ''}</div>
            </div>
            ${formData.summary ? `<div class="section"><div class="section-title">Summary</div><p>${formData.summary}</p></div>` : ''}
            ${formData.education.some(e => e.institution) ? `<div class="section"><div class="section-title">Education</div>` + 
              formData.education.filter(e => e.institution).map(edu => `
                <div class="item">
                  <div class="item-header"><span class="item-title">${edu.institution}</span><span>${edu.startYear} - ${edu.endYear}</span></div>
                  <div>${edu.degree} ${edu.field ? 'in ' + edu.field : ''}</div>
                  ${edu.percentage ? `<div>Percentage: ${edu.percentage}</div>` : ''}
                </div>
              `).join('') + `</div>` : ''}
            ${formData.skills.length > 0 ? `<div class="section"><div class="section-title">Skills</div><div class="skills">` + 
              formData.skills.map(skill => `<span class="skill">${skill}</span>`).join('') + `</div></div>` : ''}
            ${formData.projects.some(p => p.title) ? `<div class="section"><div class="section-title">Projects</div>` + 
              formData.projects.filter(p => p.title).map(project => `
                <div class="item">
                  <div class="item-title">${project.title}</div>
                  ${project.technologies ? `<div>Technologies: ${project.technologies}</div>` : ''}
                  ${project.description ? `<div>${project.description}</div>` : ''}
                </div>
              `).join('') + `</div>` : ''}
            ${formData.experience.some(e => e.company) ? `<div class="section"><div class="section-title">Experience</div>` + 
              formData.experience.filter(e => e.company).map(exp => `
                <div class="item">
                  <div class="item-header"><span class="item-title">${exp.position}</span><span>${exp.startDate} - ${exp.endDate}</span></div>
                  <div>${exp.company}</div>
                  ${exp.description ? `<div>${exp.description}</div>` : ''}
                </div>
              `).join('') + `</div>` : ''}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      setLoading(false);
    }, 500);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            Resume Builder
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Create and download your professional resume
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
          <button
            onClick={handleDownload}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Professional Summary</label>
                <textarea
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="Write a Brief summary about yourself..."
                />
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5" /> Education
              </h2>
              <button onClick={() => addItem('education')} className="text-primary-500 hover:text-primary-600">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {formData.education.map((edu, index) => (
              <div key={index} className="mb-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="institution"
                    value={edu.institution}
                    onChange={(e) => handleChange(e, index, 'education')}
                    placeholder="Institution"
                    className="px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    name="degree"
                    value={edu.degree}
                    onChange={(e) => handleChange(e, index, 'education')}
                    placeholder="Degree"
                    className="px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    name="field"
                    value={edu.field}
                    onChange={(e) => handleChange(e, index, 'education')}
                    placeholder="Field of Study"
                    className="px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    name="percentage"
                    value={edu.percentage}
                    onChange={(e) => handleChange(e, index, 'education')}
                    placeholder="Percentage/CGPA"
                    className="px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    name="startYear"
                    value={edu.startYear}
                    onChange={(e) => handleChange(e, index, 'education')}
                    placeholder="Start Year"
                    className="px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    name="endYear"
                    value={edu.endYear}
                    onChange={(e) => handleChange(e, index, 'education')}
                    placeholder="End Year"
                    className="px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                {formData.education.length > 1 && (
                  <button onClick={() => removeItem('education', index)} className="mt-2 text-red-500 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Code className="w-5 h-5" /> Skills
            </h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <button onClick={addSkill} className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full flex items-center gap-2">
                  {skill}
                  <button onClick={() => removeSkill(index)} className="hover:text-red-500">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Projector className="w-5 h-5" /> Projects
              </h2>
              <button onClick={() => addItem('projects')} className="text-primary-500 hover:text-primary-600">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {formData.projects.map((project, index) => (
              <div key={index} className="mb-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="space-y-3">
                  <input
                    type="text"
                    name="title"
                    value={project.title}
                    onChange={(e) => handleChange(e, index, 'projects')}
                    placeholder="Project Title"
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <textarea
                    name="description"
                    value={project.description}
                    onChange={(e) => handleChange(e, index, 'projects')}
                    placeholder="Description"
                    rows={2}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    name="technologies"
                    value={project.technologies}
                    onChange={(e) => handleChange(e, index, 'projects')}
                    placeholder="Technologies Used"
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                {formData.projects.length > 1 && (
                  <button onClick={() => removeItem('projects', index)} className="mt-2 text-red-500 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Experience */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5" /> Experience
              </h2>
              <button onClick={() => addItem('experience')} className="text-primary-500 hover:text-primary-600">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {formData.experience.map((exp, index) => (
              <div key={index} className="mb-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="space-y-3">
                  <input
                    type="text"
                    name="company"
                    value={exp.company}
                    onChange={(e) => handleChange(e, index, 'experience')}
                    placeholder="Company Name"
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    name="position"
                    value={exp.position}
                    onChange={(e) => handleChange(e, index, 'experience')}
                    placeholder="Position"
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      name="startDate"
                      value={exp.startDate}
                      onChange={(e) => handleChange(e, index, 'experience')}
                      placeholder="Start Date"
                      className="px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      name="endDate"
                      value={exp.endDate}
                      onChange={(e) => handleChange(e, index, 'experience')}
                      placeholder="End Date"
                      className="px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <textarea
                    name="description"
                    value={exp.description}
                    onChange={(e) => handleChange(e, index, 'experience')}
                    placeholder="Job Description"
                    rows={2}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                {formData.experience.length > 1 && (
                  <button onClick={() => removeItem('experience', index)} className="mt-2 text-red-500 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Preview Section */}
        <div className="sticky top-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
              <h3 className="font-semibold text-slate-800 dark:text-white text-center">Resume Preview</h3>
            </div>
            <div ref={resumeRef} className="p-8 bg-white text-sm" style={{ minHeight: '297mm' }}>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">{formData.name || 'Your Name'}</h1>
                <div className="flex justify-center gap-4 mt-2 text-slate-600 text-sm">
                  {formData.email && <span>{formData.email}</span>}
                  {formData.phone && <span>| {formData.phone}</span>}
                </div>
              </div>

              {formData.summary && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-800 border-b border-slate-300 pb-1 mb-3">Summary</h2>
                  <p className="text-slate-600">{formData.summary}</p>
                </div>
              )}

              {formData.education.some(e => e.institution) && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-800 border-b border-slate-300 pb-1 mb-3">Education</h2>
                  {formData.education.filter(e => e.institution).map((edu, index) => (
                    <div key={index} className="mb-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-800">{edu.institution}</span>
                        <span className="text-slate-600">{edu.startYear} - {edu.endYear}</span>
                      </div>
                      <p className="text-slate-600">{edu.degree} {edu.field && `in ${edu.field}`}</p>
                      {edu.percentage && <p className="text-slate-600">Percentage: {edu.percentage}</p>}
                    </div>
                  ))}
                </div>
              )}

              {formData.skills.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-800 border-b border-slate-300 pb-1 mb-3">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {formData.projects.some(p => p.title) && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-800 border-b border-slate-300 pb-1 mb-3">Projects</h2>
                  {formData.projects.filter(p => p.title).map((project, index) => (
                    <div key={index} className="mb-3">
                      <div className="font-semibold text-slate-800">{project.title}</div>
                      {project.technologies && <p className="text-sm text-slate-600">Technologies: {project.technologies}</p>}
                      {project.description && <p className="text-slate-600 mt-1">{project.description}</p>}
                    </div>
                  ))}
                </div>
              )}

              {formData.experience.some(e => e.company) && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-800 border-b border-slate-300 pb-1 mb-3">Experience</h2>
                  {formData.experience.filter(e => e.company).map((exp, index) => (
                    <div key={index} className="mb-3">
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-800">{exp.position}</span>
                        <span className="text-slate-600">{exp.startDate} - {exp.endDate}</span>
                      </div>
                      <p className="text-slate-600">{exp.company}</p>
                      {exp.description && <p className="text-slate-600 mt-1">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;

