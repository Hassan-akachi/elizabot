function Eliza() {
  this.language = "english";
}

Eliza.prototype.setLanguage = function(lang) {
  this.language = lang;
};

Eliza.prototype.removeToneMarks = function(text) {
  const map = {
    'á':'a', 'à':'a', 'ä':'a', 'â':'a',
    'é':'e', 'è':'e', 'ë':'e', 'ê':'e',
    'í':'i', 'ì':'i', 'ï':'i', 'î':'i',
    'ó':'o', 'ò':'o', 'ö':'o', 'ô':'o',
    'ú':'u', 'ù':'u', 'ü':'u', 'û':'u',
    'ń':'n', 'ñ':'n',
    'ẹ':'e', 'ẹ́':'e', 'ẹ̀':'e',
    'ọ':'o', 'ọ́':'o', 'ọ̀':'o'
  };
  return text.replace(/[^\u0000-\u007F]/g, c => map[c] || c);
};

Eliza.prototype.transform = function(input) {
  const lang = this.language;
  let cleaned = input.toLowerCase().replace(/[?.]/g, '').trim();

  if (lang === "yoruba") cleaned = this.removeToneMarks(cleaned);
  const knowledge = ELIZA_DATA[lang];

  // Normalize keys
  let matchMap = {};
  for (let key of Object.keys(knowledge)) {
    let normKey = lang === "yoruba" ? this.removeToneMarks(key) : key;
    matchMap[normKey] = knowledge[key];
  }

  // 1. Exact match
  if (matchMap[cleaned]) return matchMap[cleaned];

  // 2. Greetings
  const greetings = {
    "hi": "Hello!",
    "hello": "Hi there! Ask me something like 'Who is a parent?'",
    "how are you": "I'm doing well — thanks for asking!",
    "bye": "Goodbye! Thanks for chatting.",
    "bawo": "Mo wà dáadáa — ẹ ṣé!",
    "odabo": "Odàbọ̀! Ẹ ṣé fún ìbànújẹ."
  };
  if (greetings[cleaned]) return greetings[cleaned];

  // 3. Fuzzy match with scoring
  const inputWords = cleaned.split(/\s+/).filter(w => w.length > 2 && !["who", "is", "a", "ta", "ni", "n"].includes(w));
  let bestScore = 0;
  let bestMatch = null;

  for (let key in matchMap) {
    const keyWords = key.split(/\s+/).filter(w => w.length > 2 && !["who", "is", "a", "ta", "ni", "n"].includes(w));
    let score = 0;
    for (let word of inputWords) {
      if (keyWords.includes(word)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = key;
    }
  }

  if (bestScore > 0 && bestMatch) return matchMap[bestMatch];

  // 4. Fallback
  const fallbacks = [
    "Hmm... I don’t know that yet.",
    "That’s a good one. Ask me something else!",
    "Mi ò mọ ìtúpalẹ̀ yìí. Ṣe o le sọ ọ́ lẹ́ẹ̀kàn síi?",
    "Try: 'Who is a child?' or 'Ta ni baba?'"
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};
