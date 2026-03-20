export const sections = [
  {
    key: 'reading-writing',
    title: 'Reading & Writing',
    durationSeconds: 1920,
  },
  {
    key: 'math',
    title: 'Math',
    durationSeconds: 2100,
  },
]

export const questions = [
  // Reading & Writing
  {
    id: 'rw-1',
    sectionKey: 'reading-writing',
    prompt:
      'Which choice completes the text with the most logical transition? "The researcher spent years analyzing the data. _____, her findings contradicted the prevailing theory."',
    options: [
      { key: 'A', text: 'However' },
      { key: 'B', text: 'Similarly' },
      { key: 'C', text: 'Consequently' },
      { key: 'D', text: 'For instance' },
    ],
    correctAnswer: 'A',
    explanation:
      '"However" signals a contrast between the years of work and the unexpected outcome.',
    skillTag: 'Transitions',
  },
  {
    id: 'rw-2',
    sectionKey: 'reading-writing',
    prompt:
      'As used in the sentence, "mitigate" most nearly means: "New irrigation techniques help farmers mitigate the effects of drought."',
    options: [
      { key: 'A', text: 'ignore' },
      { key: 'B', text: 'lessen' },
      { key: 'C', text: 'avoid' },
      { key: 'D', text: 'predict' },
    ],
    correctAnswer: 'B',
    explanation:
      'To mitigate means to make less severe; irrigation lessens the harmful effects of drought.',
    skillTag: 'Words in Context',
  },
  {
    id: 'rw-3',
    sectionKey: 'reading-writing',
    prompt:
      'A short article argues that renewable energy adoption will depend not only on lower costs but also on expanded transmission lines and battery storage. Which claim would the author most likely support?',
    options: [
      { key: 'A', text: 'It will completely replace fossil fuels within a decade.' },
      { key: 'B', text: 'Investment in infrastructure is essential for its expansion.' },
      { key: 'C', text: 'It has no drawbacks compared to traditional sources.' },
      { key: 'D', text: 'Government regulation should be eliminated to encourage growth.' },
    ],
    correctAnswer: 'B',
    explanation:
      'The author would most likely argue that the need for infrastructure development to support renewable energy growth.',
    skillTag: 'Inference',
  },
  {
    id: 'rw-4',
    sectionKey: 'reading-writing',
    prompt:
      'Which choice best introduces the main idea of the paragraph? "_____ In 1969, astronauts first landed on the moon, demonstrating that ambitious goals could be achieved through sustained effort."',
    options: [
      { key: 'A', text: 'Space travel has always been dangerous.' },
      { key: 'B', text: 'The moon landing was a pivotal moment in human history.' },
      { key: 'C', text: 'Many nations competed in the space race.' },
      { key: 'D', text: 'Technology has improved significantly since the 1960s.' },
    ],
    correctAnswer: 'B',
    explanation:
      'The sentence that follows elaborates on why the moon landing was significant.',
    skillTag: 'Central Idea',
  },
  {
    id: 'rw-5',
    sectionKey: 'reading-writing',
    prompt:
      'In an experiment, identical plants were grown under different light intensities, and plants receiving more light showed faster growth. Which conclusion is best supported?',
    options: [
      { key: 'A', text: 'Plants grow faster in complete darkness.' },
      { key: 'B', text: 'Light intensity affects the rate of photosynthesis.' },
      { key: 'C', text: 'Soil composition matters more than light.' },
      { key: 'D', text: 'All plant species respond identically to light.' },
    ],
    correctAnswer: 'B',
    explanation:
      'The experiment varied light levels and observed corresponding changes in growth rates.',
    skillTag: 'Command of Evidence',
  },
  {
    id: 'rw-6',
    sectionKey: 'reading-writing',
    prompt:
      'Which revision best improves the precision of the sentence? Original: "The study had a lot of participants."',
    options: [
      { key: 'A', text: 'The study had many participants.' },
      { key: 'B', text: 'The study included over 2,000 participants.' },
      { key: 'C', text: 'The study had participants.' },
      { key: 'D', text: 'The study had a great number of participants.' },
    ],
    correctAnswer: 'B',
    explanation:
      'Specifying "over 2,000" provides concrete, precise information.',
    skillTag: 'Precision',
  },
  // Math
  {
    id: 'math-1',
    sectionKey: 'math',
    prompt:
      'If 3x + 7 = 22, what is the value of x?',
    options: [
      { key: 'A', text: '3' },
      { key: 'B', text: '5' },
      { key: 'C', text: '7' },
      { key: 'D', text: '15' },
    ],
    correctAnswer: 'B',
    explanation:
      'Subtract 7 from both sides: 3x = 15. Divide by 3: x = 5.',
    skillTag: 'Linear Equations',
  },
  {
    id: 'math-2',
    sectionKey: 'math',
    prompt:
      'A shirt originally costs $40. During a sale, it is discounted by 25%. What is the sale price?',
    options: [
      { key: 'A', text: '$10' },
      { key: 'B', text: '$15' },
      { key: 'C', text: '$30' },
      { key: 'D', text: '$35' },
    ],
    correctAnswer: 'C',
    explanation:
      '25% of 40 is 10. Sale price = 40 - 10 = $30.',
    skillTag: 'Percents',
  },
  {
    id: 'math-3',
    sectionKey: 'math',
    prompt:
      'If f(x) = 2x² - 5 and f(a) = 13, what is one possible value of a?',
    options: [
      { key: 'A', text: '2' },
      { key: 'B', text: '3' },
      { key: 'C', text: '4' },
      { key: 'D', text: '5' },
    ],
    correctAnswer: 'B',
    explanation:
      '2a² - 5 = 13 → 2a² = 18 → a² = 9 → a = 3 or a = -3.',
    skillTag: 'Quadratic Functions',
  },
  {
    id: 'math-4',
    sectionKey: 'math',
    prompt:
      'In a right triangle, the two legs have lengths 6 and 8. What is the length of the hypotenuse?',
    options: [
      { key: 'A', text: '10' },
      { key: 'B', text: '14' },
      { key: 'C', text: '48' },
      { key: 'D', text: '100' },
    ],
    correctAnswer: 'A',
    explanation:
      'By the Pythagorean theorem: 6² + 8² = 36 + 64 = 100; √100 = 10.',
    skillTag: 'Right Triangles',
  },
  {
    id: 'math-5',
    sectionKey: 'math',
    prompt:
      'A car travels 180 miles in 3 hours. At the same rate, how far would it travel in 5 hours?',
    options: [
      { key: 'A', text: '60 miles' },
      { key: 'B', text: '300 miles' },
      { key: 'C', text: '360 miles' },
      { key: 'D', text: '540 miles' },
    ],
    correctAnswer: 'B',
    explanation:
      'Rate = 180/3 = 60 mph. Distance = 60 × 5 = 300 miles.',
    skillTag: 'Rates',
  },
  {
    id: 'math-6',
    sectionKey: 'math',
    prompt:
      'If 2^3 · 2^5 = 2^n, what is the value of n?',
    options: [
      { key: 'A', text: '8' },
      { key: 'B', text: '15' },
      { key: 'C', text: '32' },
      { key: 'D', text: '10' },
    ],
    correctAnswer: 'A',
    explanation:
      'When multiplying powers with the same base, add the exponents: 3 + 5 = 8.',
    skillTag: 'Exponents',
  },
]
