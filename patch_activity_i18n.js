const fs = require('fs');
const path = './src/utils/i18n.js';
let content = fs.readFileSync(path, 'utf8');

const translations = {
  'You just came home from shopping.': {
    Hindi: 'आप अभी खरीदारी करके घर आए हैं।', Assamese: 'আপুনি এইমাত্ৰ বজাৰ কৰি ঘৰলৈ আহিছে।', Bengali: 'আপনি এইমাত্র কেনাকাটা করে বাড়ি এসেছেন।'
  },
  'What did you bring inside?': {
    Hindi: 'आप अंदर क्या लाए?', Assamese: 'আপুনি ভিতৰলৈ কি আনিলে?', Bengali: 'আপনি ভিতরে কি নিয়ে এসেছেন?'
  },
  '🔑 Key, 🛍️ Bags, 🧥 Coat': {
    Hindi: '🔑 चाबी, 🛍️ बैग, 🧥 कोट', Assamese: '🔑 চাবি, 🛍️ বেগ, 🧥 কোট', Bengali: '🔑 চাবি, 🛍️ ব্যাগ, 🧥 কোট'
  },
  '🍎 Apple, 🛍️ Bags, 🌂 Umbrella': {
    Hindi: '🍎 सेब, 🛍️ बैग, 🌂 छाता', Assamese: '🍎 আপেল, 🛍️ বেগ, 🌂 ছাতি', Bengali: '🍎 আপেল, 🛍️ ব্যাগ, 🌂 ছাতা'
  },
  '📱 Phone, 🧥 Coat, 🧢 Hat': {
    Hindi: '📱 फोन, 🧥 कोट, 🧢 टोपी', Assamese: '📱 ফোন, 🧥 কোট, 🧢 টুপী', Bengali: '📱 ফোন, 🧥 কোট, 🧢 টুপি'
  }
};

const languages = ['English', 'Hindi', 'Assamese', 'Bengali', 'Bodo', 'Manipuri', 'Khasi', 'Garo', 'Mizo', 'Nepali'];

for (const lang of languages) {
  let langBlock = "";
  for (const [enKey, transObj] of Object.entries(translations)) {
    const safeKey = enKey.includes("'") ? `"${enKey}"` : `'${enKey}'`;
    let val = enKey;
    if (transObj[lang]) val = transObj[lang];
    const safeVal = val.replace(/'/g, "\\'");
    langBlock += `    ${safeKey}: '${safeVal}',\n`;
  }
  const regex = new RegExp(`('${lang}'|${lang}):\\s*\\{([\\s\\S]*?)\\n\\s*\\}`, 'g');
  content = content.replace(regex, (match, p1, p2) => {
    return `'${lang}': {${p2},\n${langBlock}  }`;
  });
}

fs.writeFileSync(path, content, 'utf8');
console.log('Updated Activity strings in i18n.js');
