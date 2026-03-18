// All aptitude categories and their topics
const aptitudeData = {
  quantitative: {
    name: 'Quantitative Aptitude',
    color: 'from-blue-500 to-cyan-500',
    icon: '1',
    topics: [
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
    ]
  },
  'verbal-ability': {
    name: 'Verbal Ability',
    color: 'from-purple-500 to-pink-500',
    icon: '2',
    topics: [
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
    ]
  },
  'logical-reasoning': {
    name: 'Logical Reasoning',
    color: 'from-green-500 to-emerald-500',
    icon: '3',
    topics: [
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
    ]
  },
  'verbal-reasoning': {
    name: 'Verbal Reasoning',
    color: 'from-orange-500 to-amber-500',
    icon: '4',
    topics: [
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
    ]
  },
  'non-verbal-reasoning': {
    name: 'Non Verbal Reasoning',
    color: 'from-pink-500 to-rose-500',
    icon: '5',
    topics: [
      { id: 'figure-matrix', name: 'Figure Matrix' },
      { id: 'pattern-completion', name: 'Pattern Completion' },
      { id: 'series', name: 'Series' },
      { id: 'analogy', name: 'Analogy' },
      { id: 'counting-figures', name: 'Counting of Figures' }
    ]
  },
  'data-interpretation': {
    name: 'Data Interpretation',
    color: 'from-indigo-500 to-purple-500',
    icon: '6',
    topics: [
      { id: 'tabulation', name: 'Tabulation' },
      { id: 'bar-graphs', name: 'Bar Graphs' },
      { id: 'line-graphs', name: 'Line Graphs' },
      { id: 'pie-charts', name: 'Pie Charts' }
    ]
  }
};

// Get all categories
const getCategories = () => {
  return Object.keys(aptitudeData).map(key => ({
    id: key,
    name: aptitudeData[key].name,
    color: aptitudeData[key].color,
    icon: aptitudeData[key].icon,
    topicCount: aptitudeData[key].topics.length
  }));
};

// Get topics for a category
const getTopics = (category) => {
  if (!aptitudeData[category]) {
    return null;
  }
  return aptitudeData[category].topics.map(topic => ({
    ...topic,
    category
  }));
};

// Get all topics
const getAllTopics = () => {
  const allTopics = [];
  Object.keys(aptitudeData).forEach(category => {
    aptitudeData[category].topics.forEach(topic => {
      allTopics.push({
        ...topic,
        category,
        categoryName: aptitudeData[category].name,
        color: aptitudeData[category].color
      });
    });
  });
  return allTopics;
};

// Get topic info
const getTopicInfo = (category, topicId) => {
  if (!aptitudeData[category]) {
    return null;
  }
  const topic = aptitudeData[category].topics.find(t => t.id === topicId);
  if (!topic) {
    return null;
  }
  return {
    ...topic,
    category,
    categoryName: aptitudeData[category].name,
    color: aptitudeData[category].color
  };
};

// Get all topics as flat array for admin
const getTopicsForAdmin = () => {
  const topics = [];
  Object.keys(aptitudeData).forEach(category => {
    aptitudeData[category].topics.forEach(topic => {
      topics.push({
        id: topic.id,
        name: topic.name,
        category,
        categoryName: aptitudeData[category].name
      });
    });
  });
  return topics;
};

module.exports = {
  aptitudeData,
  getCategories,
  getTopics,
  getAllTopics,
  getTopicInfo,
  getTopicsForAdmin
};
