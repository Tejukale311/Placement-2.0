import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

import { ArrowLeft, ChevronRight, Loader2, Brain, Code, BookOpen, Folder, FileCode } from 'lucide-react';

import { programmingSections } from '../../data/programmingConfig';

const ProgrammingTopic = () => {
  const { section } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [section]);

  const currentSection = programmingSections.find(s => s.id === section);

  if (!currentSection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center p-8">
          <ArrowLeft className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Section not found</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Go back to programming sections</p>
          <Link to="/programming" className="btn btn-primary">
            Back to Sections
          </Link>
        </div>
      </div>
    );
  }

  const formatTopicName = (topic) => {
    return topic.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${currentSection.gradient} shadow-lg`}>



            {(() => {
              switch (currentSection.icon) {
                case 'Code': return <Code className="w-6 h-6 text-white" />;
                case 'BookOpen': return <BookOpen className="w-6 h-6 text-white" />;
                case 'Folder': return <Folder className="w-6 h-6 text-white" />;
                case 'FileCode': return <FileCode className="w-6 h-6 text-white" />;
                default: return <Code className="w-6 h-6 text-white" />;
              }
            })()}



          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{currentSection.name}</h1>
            <p className="text-slate-500 dark:text-slate-400">{currentSection.topics.length} topics available</p>
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentSection.topics.map((topic, index) => (
          <Link 
            key={topic} 
            to={`/programming/${section}/${formatTopicName(topic)}`}
            className="group card card-hover p-6 relative overflow-hidden"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 shadow-lg group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6 text-slate-600 dark:text-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-primary-600 mb-2 line-clamp-2">
                  {topic}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Practice {topic.toLowerCase()}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all ml-auto" />
            </div>
          </Link>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mr-3" />
          <span className="text-slate-500">Loading topics...</span>
        </div>
      )}
    </div>
  );
};

export default ProgrammingTopic;

