// Word lists organized by week
export const wordLists: Record<string, string[]> = {
  allWeeks: [], // This will be populated with all words
  week4: [
    'chocolate', 'umbrella', 'telescope', 'adventure', 'pineapple',
    'computer', 'keyboard', 'calendar', 'dinosaur', 'universe'
  ],
  week3: [
    'elephant', 'giraffe', 'penguin', 'butterfly', 'octopus',
    'rainbow', 'mountain', 'sunshine', 'waterfall', 'dolphin'
  ],
  week2: [
    'school', 'friend', 'house', 'plant', 'water',
    'pencil', 'paper', 'chair', 'table', 'clock'
  ],
  week1: [
    'cat', 'dog', 'hat', 'run', 'jump',
    'play', 'fish', 'bird', 'book', 'tree'
  ]
};

// Populate allWeeks with all words from all weeks
const weekKeys = Object.keys(wordLists).filter(key => key !== 'allWeeks');
wordLists.allWeeks = weekKeys.reduce((allWords, weekKey) => {
  return [...allWords, ...wordLists[weekKey]];
}, [] as string[]);

// Shuffle the allWeeks array
wordLists.allWeeks.sort(() => Math.random() - 0.5);

export type WeekLevel = keyof typeof wordLists;