/**
 * Centralized Aptitude Topics Configuration
 * Copied from backend/data/aptitudeTopics.js for frontend consistency
 * This ensures User Dashboard and Admin Dashboard use EXACT same topics
 */

import { 
  Calculator, 
  MessageSquare, 
  Lightbulb, 
  Brain, 
  Eye, 
  BarChart3 
} from 'lucide-react';

export const categoryConfig = {
  quantitative: {
    name: 'Quantitative Aptitude',
    icon: Calculator,
    gradient: 'from-blue-500 to-cyan-500',
    description: 'Number systems, algebra, arithmetic'
  },
  'verbal-ability': {
    name: 'Verbal Ability',
    icon: MessageSquare,
    gradient: 'from-purple-500 to-pink-500',
    description: 'Grammar, vocabulary, comprehension'
  },
  'logical-reasoning': {
    name: 'Logical Reasoning',
    icon: Lightbulb,
    gradient: 'from-green-500 to-emerald-500',
    description: 'Puzzles, sequences, deductions'
  },
  'verbal-reasoning': {
    name: 'Verbal Reasoning',
    icon: Brain,
    gradient: 'from-orange-500 to-amber-500',
    description: 'Coding, arrangements, blood relations'
  },
  'non-verbal-reasoning': {
    name: 'Non Verbal Reasoning',
    icon: Eye,
    gradient: 'from-pink-500 to-rose-500',
    description: 'Figures, patterns, sequences'
  },
  'data-interpretation': {
    name: 'Data Interpretation',
    icon: BarChart3,
    gradient: 'from-indigo-500 to-purple-500',
    description: 'Charts, graphs, tables'
  }
};

export const aptitudeTopics = {
  quantitative: [
    { id: 'number-system', name: 'Number System' },
    { id: 'hcf-lcm', name: 'HCF and LCM' },
    { id: 'average', name: 'Average' },
    { id: 'arithmetic-progression', name: 'Arithmetic Progression' },
    { id: 'simple-interest', name: 'Simple Interest' },
    { id: 'ratio-proportion', name: 'Ratio and Proportion' },
    { id: 'partnership', name: 'Partnership' },
    { id: 'mixture-alligation', name: 'Mixture and Alligation' },
    { id: 'chain-rule', name: 'Chain Rule' },
    { id: 'time-and-work', name: 'Time and Work' },
    { id: 'races-games', name: 'Races and Games' },
    { id: 'logarithm', name: 'Logarithm' },
    { id: 'percentage', name: 'Percentage' },
    { id: 'ages', name: 'Ages' },
    { id: 'pipes-cistern', name: 'Pipes and Cistern' },
    { id: 'time-speed-distance', name: 'Time Speed and Distance' },
    { id: 'problems-on-trains', name: 'Problems on Trains' },
    { id: 'boats-streams', name: 'Boats and Streams' },
    { id: 'circles', name: 'Circles' },
    { id: 'mensuration', name: 'Mensuration' },
    { id: 'height-distance', name: 'Height and Distance' },
    { id: 'coordinate-geometry', name: 'Coordinate Geometry' },
    { id: 'profit-loss', name: 'Profit and Loss' },
    { id: 'compound-interest', name: 'Compound Interest' },
    { id: 'permutations-combinations', name: 'Permutations and Combinations' },
    { id: 'probability', name: 'Probability' },
    { id: 'geometric-progression', name: 'Geometric Progression' }
  ],
  'verbal-ability': [
    { id: 'reading-comprehension', name: 'Reading Comprehension' },
    { id: 'error-spotting', name: 'Error Spotting' },
    { id: 'sentence-formation', name: 'Sentence Formation' },
    { id: 'sentence-correction', name: 'Sentence Correction' },
    { id: 'sentence-improvement', name: 'Sentence Improvement' },
    { id: 'ordering-of-sentences', name: 'Ordering of Sentences' },
    { id: 'paragraph-formation', name: 'Paragraph Formation' },
    { id: 'cloze-test', name: 'Cloze Test' },
    { id: 'synonyms', name: 'Synonyms' },
    { id: 'antonyms', name: 'Antonyms' },
    { id: 'selecting-words', name: 'Selecting Words' },
    { id: 'spellings', name: 'Spellings' },
    { id: 'completing-statements', name: 'Completing Statements' },
    { id: 'verbal-analogies', name: 'Verbal Analogies' },
    { id: 'one-word-substitutes', name: 'One Word Substitutes' },
    { id: 'idioms-phrases', name: 'Idioms and Phrases' },
    { id: 'change-of-voice', name: 'Change of Voice' },
    { id: 'change-of-speech', name: 'Change of Speech' }
  ],
  'logical-reasoning': [
    { id: 'order-ranking', name: 'Order and Ranking' },
    { id: 'clock', name: 'Clock' },
    { id: 'calendar', name: 'Calendar' },
    { id: 'odd-man-out', name: 'Odd Man Out' },
    { id: 'series-completion', name: 'Series Completion' },
    { id: 'letter-symbol-series', name: 'Letter and Symbol Series' },
    { id: 'number-series', name: 'Number Series' },
    { id: 'logical-problems', name: 'Logical Problems' },
    { id: 'making-judgements', name: 'Making Judgements' },
    { id: 'analyzing-arguments', name: 'Analyzing Arguments' },
    { id: 'statement-assumption', name: 'Statement and Assumption' },
    { id: 'course-of-action', name: 'Course of Action' },
    { id: 'statement-conclusion', name: 'Statement and Conclusion' },
    { id: 'cause-effect', name: 'Cause and Effect' },
    { id: 'statement-argument', name: 'Statement and Argument' },
    { id: 'theme-detection', name: 'Theme Detection' }
  ],
  'verbal-reasoning': [
    { id: 'coding-decoding', name: 'Coding and Decoding' },
    { id: 'seating-arrangement', name: 'Seating Arrangement' },
    { id: 'syllogism', name: 'Syllogism' },
    { id: 'blood-relation', name: 'Blood Relation' },
    { id: 'direction-sense', name: 'Direction Sense' },
    { id: 'data-sufficiency', name: 'Data Sufficiency' },
    { id: 'cube-cuboid', name: 'Cube and Cuboid' },
    { id: 'dice', name: 'Dice' },
    { id: 'logical-sequence-words', name: 'Logical Sequence of Words' },
    { id: 'venn-diagrams', name: 'Venn Diagrams' },
    { id: 'analogy', name: 'Analogy' }
  ],
  'non-verbal-reasoning': [
    { id: 'figure-matrix', name: 'Figure Matrix' },
    { id: 'pattern-completion', name: 'Pattern Completion' },
    { id: 'series', name: 'Series' },
    { id: 'analogy', name: 'Analogy' },
    { id: 'counting-figures', name: 'Counting of Figures' }
  ],
  'data-interpretation': [
    { id: 'tabulation', name: 'Tabulation' },
    { id: 'bar-graphs', name: 'Bar Graphs' },
    { id: 'line-graphs', name: 'Line Graphs' },
    { id: 'pie-charts', name: 'Pie Charts' }
  ]
};

export const aptitudeCategories = Object.keys(aptitudeTopics).map(key => ({
  id: key,
  name: categoryConfig[key].name
}));

// Utility function for topic color
export const getTopicColor = (category) => {
  return categoryConfig[category]?.gradient || 'from-blue-500 to-cyan-500';
};

