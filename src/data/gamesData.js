export const gamesData = {
  // === MEMORY MASTERY ===
  'Where are my keys?': {
    type: 'memory',
    intro: 'You just came home from shopping.',
    objects: ['🔑', '🛍️', '🧥'],
    question: 'What did you bring inside?',
    options: [
      '🔑 Key, 🛍️ Bags, 🧥 Coat',
      '🍎 Apple, 🛍️ Bags, 🌂 Umbrella',
      '📱 Phone, 🧥 Coat, 🧢 Hat'
    ],
    correctAnswer: 0
  },
  'Family Face Match': {
    type: 'memory',
    intro: 'Your family is visiting today.',
    objects: ['👧🏽', '🧔🏾', '👵🏽'],
    question: 'Who came to visit?',
    options: [
      'Priya, Rahul, Grandma',
      'Aunt Maya, Uncle Joe, Ananya',
      'The Postman, Priya, Rahul'
    ],
    correctAnswer: 0
  },
  'Remember the Sequence': {
    type: 'memory',
    intro: 'Look at the order of these items carefully.',
    objects: ['1️⃣', '2️⃣', '3️⃣'],
    question: 'What was the correct order?',
    options: [
      '3️⃣, 2️⃣, 1️⃣',
      '1️⃣, 2️⃣, 3️⃣',
      '2️⃣, 1️⃣, 3️⃣'
    ],
    correctAnswer: 1
  },
  'Grocery List Recall': {
    type: 'memory',
    intro: 'We need to buy these from the market.',
    objects: ['🍞', '🥚', '🥛'],
    question: 'What was on our shopping list?',
    options: [
      '🍞 Bread, 🥚 Eggs, 🥛 Milk',
      '🍎 Apples, 🍌 Bananas, 🍞 Bread',
      '🧀 Cheese, 🥚 Eggs, 🥩 Meat'
    ],
    correctAnswer: 0
  },
  'Photo Storyteller': {
    type: 'memory',
    intro: 'Remember this lovely day at the park?',
    objects: ['🌳', '🦆', '☀️'],
    question: 'What did we see at the park?',
    options: [
      '🏢 Buildings, 🚗 Cars, 🚦 Lights',
      '🌳 Trees, 🦆 Ducks, ☀️ Sun',
      '🏖️ Beach, 🌊 Ocean, 🐚 Shells'
    ],
    correctAnswer: 1
  },
  'Name that Tune': {
    type: 'memory',
    intro: 'Listen to this classic instrument.',
    objects: ['📻', '🎵', '🎸'],
    question: 'Which instrument did you see?',
    options: [
      '🎹 Piano',
      '🎸 Guitar',
      '🎻 Violin'
    ],
    correctAnswer: 1
  },

  // === ATTENTION TRACKER ===
  'Find the Red Apple': {
    type: 'attention',
    target: '🍎',
    distractors: ['🍏', '🍐', '🍋'],
    gridSize: 9
  },
  'Sort the Shapes': {
    type: 'attention',
    target: '🟦',
    distractors: ['🔴', '🟡', '🔺'],
    gridSize: 9
  },
  'Catch the Balloon': {
    type: 'attention',
    target: '🎈',
    distractors: ['🪁', '🏮', '🎆'],
    gridSize: 9
  },
  'Color Matching': {
    type: 'attention',
    target: '❤️',
    distractors: ['💚', '💙', '💛'],
    gridSize: 9
  },
  'Spot the Difference': {
    type: 'attention',
    target: '🐶',
    distractors: ['🐱', '🐱', '🐱'],
    gridSize: 9
  },
  'Track the Moving Dot': {
    type: 'attention',
    target: '🎯',
    distractors: ['⚪', '⚪', '⚪'],
    gridSize: 9
  },

  // === DAILY ROUTINE ===
  'Morning Routine Check': {
    type: 'routine',
    icon: '☀️',
    question: 'What is the first thing you do when you wake up?',
    options: [
      'Eat dinner',
      'Take morning medicine',
      'Go to sleep'
    ],
    correctAnswer: 1
  },
  'What Time is it?': {
    type: 'routine',
    icon: '🕐',
    question: 'We just finished lunch. What time of day is it?',
    options: [
      'Early Morning',
      'Afternoon',
      'Midnight'
    ],
    correctAnswer: 1
  },
  'Next Meal Guesser': {
    type: 'routine',
    icon: '🍽️',
    question: 'You just had Breakfast. What is the next meal?',
    options: [
      'Lunch',
      'Dinner',
      'Midnight Snack'
    ],
    correctAnswer: 0
  },
  'Medication Organizer': {
    type: 'routine',
    icon: '💊',
    question: 'Where do we keep the blood pressure medicine?',
    options: [
      'In the fridge',
      'On the kitchen counter',
      'Under the bed'
    ],
    correctAnswer: 1
  },
  'Bedtime Steps': {
    type: 'routine',
    icon: '🌙',
    question: 'What do you do right before getting into bed?',
    options: [
      'Go for a run',
      'Brush teeth',
      'Make breakfast'
    ],
    correctAnswer: 1
  },
  'Event Sequencer': {
    type: 'routine',
    icon: '📅',
    question: 'Which event happens first in the year?',
    options: [
      'New Year\'s Day',
      'Diwali',
      'Christmas'
    ],
    correctAnswer: 0
  },

  // === LANGUAGE & WORDS ===
  'Name the Object': {
    type: 'routine', // using routine engine for simple Q&A
    icon: '☕',
    question: 'What do we call this object?',
    options: [
      'A Tea Cup',
      'A Television',
      'A Shoe'
    ],
    correctAnswer: 0
  },
  'Word Association': {
    type: 'routine',
    icon: '🌧️',
    question: 'Which word goes best with Rain?',
    options: [
      'Umbrella',
      'Sunscreen',
      'Sandals'
    ],
    correctAnswer: 0
  },
  'Complete the Sentence': {
    type: 'routine',
    icon: '✍️',
    question: 'The sky is so blue and the sun is ___',
    options: [
      'Sleeping',
      'Shining',
      'Crying'
    ],
    correctAnswer: 1
  },
  'Rhyme Time': {
    type: 'routine',
    icon: '🎵',
    question: 'Which word rhymes with CAT?',
    options: [
      'Dog',
      'Hat',
      'Bird'
    ],
    correctAnswer: 1
  },
  'Spell your Name': {
    type: 'routine',
    icon: '🔤',
    question: 'If your name is Rahul, what is the first letter?',
    options: [
      'R',
      'A',
      'H'
    ],
    correctAnswer: 0
  },
  'Story Completion': {
    type: 'routine',
    icon: '📖',
    question: 'Once upon a time, there was a brave ___',
    options: [
      'Toaster',
      'Knight',
      'Window'
    ],
    correctAnswer: 1
  }
};
