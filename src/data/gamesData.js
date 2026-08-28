export const gamesData = {
  memory: [
    {
      level: 1,
      title: 'Level 1: Daily Items',
      type: 'memory',
      intro: 'Look at these 2 items carefully.',
      objects: ['🔑', '🛍️'], 
      question: 'What did you see?',
      options: ['🔑 Key, 🛍️ Bags', '🍎 Apple, 🌂 Umbrella', '📱 Phone, 🧢 Hat'],
      correctAnswer: 0,
      duration: 5000 // 5 seconds
    },
    {
      level: 2,
      title: 'Level 2: Shopping Trip',
      type: 'memory',
      intro: 'Look at these 3 items carefully.',
      objects: ['🍅', '🥔', '🧅'],
      question: 'What did you buy at the market?',
      options: ['💻 Laptop, 🚗 Car, 📚 Books', '🍅 Tomato, 🥔 Potato, 🧅 Onion', '🍞 Bread, 🥚 Eggs, 🥛 Milk'],
      correctAnswer: 1,
      duration: 4000 // 4 seconds
    },
    {
      level: 3,
      title: 'Level 3: Family Visit',
      type: 'memory',
      intro: 'Look at these 4 people carefully.',
      objects: ['👧🏽', '🧔🏾', '👵🏽', '👶🏻'],
      question: 'Who came to visit?',
      options: ['Priya, Rahul, Grandma, Baby', 'Aunt Maya, Uncle Joe, Ananya, Postman', 'Milkman, Priya, Rahul, Neighbor'],
      correctAnswer: 0,
      duration: 3500 // 3.5 seconds
    }
  ],
  attention: [
    {
      level: 1,
      title: 'Level 1: Find the Apple',
      type: 'attention',
      target: '🍎',
      distractors: ['🍌', '🍇', '🍉'],
      gridSize: 4 // 2x2
    },
    {
      level: 2,
      title: 'Level 2: Spot the Cat',
      type: 'attention',
      target: '🐈',
      distractors: ['🐕', '🐇', '🐹', '🐦'],
      gridSize: 9 // 3x3
    },
    {
      level: 3,
      title: 'Level 3: Catch the Balloon',
      type: 'attention',
      target: '🎈',
      distractors: ['🪁', '🏮', '🎆', '🔮', '🎉', '🎊'],
      gridSize: 16 // 4x4
    }
  ],
  routine: [
    {
      level: 1,
      title: 'Level 1: Morning Tasks',
      type: 'routine',
      icon: '🌅',
      question: 'What is the first thing we usually do in the morning?',
      options: ['Eat dinner', 'Brush teeth', 'Watch TV', 'Go to sleep'],
      correctAnswer: 1
    },
    {
      level: 2,
      title: 'Level 2: Lunch Time',
      type: 'routine',
      icon: '🍲',
      question: 'What time do we usually have lunch?',
      options: ['8:00 AM', '1:00 PM', '6:00 PM', '10:00 PM'],
      correctAnswer: 1
    },
    {
      level: 3,
      title: 'Level 3: Medications',
      type: 'routine',
      icon: '💊',
      question: 'Where do we keep the blood pressure medicine?',
      options: ['In the fridge', 'On the bedside table', 'In the garage', 'Under the pillow'],
      correctAnswer: 1
    }
  ],
  language: [
    {
      level: 1,
      title: 'Level 1: Simple Pairs',
      type: 'language',
      question: 'Which word goes best with: TEA',
      options: ['Shoe', 'Biscuit', 'Car', 'Pen'],
      correctAnswer: 1
    },
    {
      level: 2,
      title: 'Level 2: Word Association',
      type: 'language',
      question: 'Which word goes best with: UMBRELLA',
      options: ['Sun', 'Rain', 'Moon', 'Star'],
      correctAnswer: 1
    },
    {
      level: 3,
      title: 'Level 3: Rhyming',
      type: 'language',
      question: 'Which word rhymes with: CAT',
      options: ['Dog', 'Fish', 'Hat', 'Bird'],
      correctAnswer: 2
    }
  ]
};
