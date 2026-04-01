import { allLanguages, codeTemplates } from './allLanguages.js';

// Filter for executable programming languages only
export const programmingLanguages = allLanguages.filter(lang => !['html', 'css', 'csharp', 'php', 'ruby', 'react', 'r'].includes(lang.id));

export const getProgrammingCodeTemplate = (langId) => {
  return codeTemplates[langId] || '// Write your solution here';
};

