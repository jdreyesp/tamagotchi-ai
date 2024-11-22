export const tamagotchiPhrases = [
  "I love making new friends!",
  "What a beautiful day!",
  "I'm feeling energetic!",
  "Want to play?",
  "*happy dance*",
  "You're the best!",
  "Yay!",
  "This is fun!",
  "I'm so happy!",
  "Let's go on an adventure!"
];

export const hungryPhrases = [
  "I'm starving...",
  "Got any snacks?",
  "My tummy is rumbling",
  "Food please!",
  "*stomach growls*"
];

export const sadPhrases = [
  "I'm feeling blue...",
  "*sighs*",
  "Need a hug",
  "I miss being happy",
  ":'("
];

export const orphanPhrases = [
  "I miss my parent...",
  "Anyone want to adopt me?",
  "I feel so alone",
  "Looking for a family",
  "*sniff*"
];

export const getRandomPhrase = (phrases: string[]) => {
  return phrases[Math.floor(Math.random() * phrases.length)];
}; 