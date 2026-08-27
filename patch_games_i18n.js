const fs = require('fs');
const path = './src/utils/i18n.js';
let content = fs.readFileSync(path, 'utf8');

const translations = {
  'Memory Mastery': {
    Hindi: 'स्मृति महारत', Assamese: 'স্মৃতি আয়ত্ত', Bengali: 'স্মৃতি আয়ত্ত'
  },
  'Where are my keys?': {
    Hindi: 'मेरी चाबियां कहां हैं?', Assamese: 'মোৰ চাবি ক\'ত?', Bengali: 'আমার চাবি কোথায়?'
  },
  'Easy': {
    Hindi: 'आसान', Assamese: 'সহজ', Bengali: 'সহজ'
  },
  'Family Face Match': {
    Hindi: 'परिवार चेहरा मिलान', Assamese: 'পৰিয়ালৰ মুখ মিল', Bengali: 'পরিবারের মুখ মেলানো'
  },
  'Medium': {
    Hindi: 'मध्यम', Assamese: 'মজলীয়া', Bengali: 'মাঝারি'
  },
  'Remember the Sequence': {
    Hindi: 'क्रम याद रखें', Assamese: 'ক্ৰমটো মনত ৰাখক', Bengali: 'ক্রম মনে রাখুন'
  },
  'Grocery List Recall': {
    Hindi: 'किराना सूची याद करना', Assamese: 'খাদ্য সামগ্ৰীৰ তালিকা মনত পেলোৱা', Bengali: 'মুদিখানার তালিকা মনে করা'
  },
  'Hard': {
    Hindi: 'कठिन', Assamese: 'कठिन', Bengali: 'কঠিন'
  },
  'Photo Storyteller': {
    Hindi: 'फोटो कहानीकार', Assamese: 'ফটো কাহিনীকাৰ', Bengali: 'ফটো গল্পকার'
  },
  'Name that Tune': {
    Hindi: 'उस धुन का नाम बताएं', Assamese: 'সেই সুৰটোৰ নাম কওক', Bengali: 'সুরটির নাম বলুন'
  },
  'Attention Tracker': {
    Hindi: 'ध्यान ट्रैकर', Assamese: 'মনোযোগ ট্ৰেকাৰ', Bengali: 'মনোযোগ ট্র্যাকার'
  },
  'Find the Red Apple': {
    Hindi: 'लाल सेब खोजें', Assamese: 'ৰঙা আপেলটো বিচাৰক', Bengali: 'লাল আপেল খুঁজুন'
  },
  'Sort the Shapes': {
    Hindi: 'आकार छाँटें', Assamese: 'আকাৰবোৰ সজাওক', Bengali: 'আকার সাজান'
  },
  'Catch the Balloon': {
    Hindi: 'गुब्बारा पकड़ें', Assamese: 'বেলুনটো ধৰক', Bengali: 'বেলুন ধরুন'
  },
  'Color Matching': {
    Hindi: 'रंग मिलान', Assamese: 'ৰং মিল', Bengali: 'রঙ মেলানো'
  },
  'Spot the Difference': {
    Hindi: 'अंतर पहचानें', Assamese: 'পার্থক্য বিচাৰক', Bengali: 'পার্থক্য খুঁজুন'
  },
  'Track the Moving Dot': {
    Hindi: 'चलती बिंदु को ट्रैक करें', Assamese: 'চলি থকা বিন্দুটো ট্ৰেক কৰক', Bengali: 'চলন্ত বিন্দু ট্র্যাক করুন'
  },
  'Daily Routine': {
    Hindi: 'दैनिक दिनचर्या', Assamese: 'দৈনন্দিন ৰুটিন', Bengali: 'দৈনন্দিন রুটিন'
  },
  'Morning Routine Check': {
    Hindi: 'सुबह की दिनचर्या की जांच', Assamese: 'ৰাতিপুৱাৰ ৰুটিন পৰীক্ষা', Bengali: 'সকালের রুটিন পরীক্ষা'
  },
  'What Time is it?': {
    Hindi: 'कितने बजे हैं?', Assamese: 'समय क्या है?', Bengali: 'কয়টা বাজে?'
  },
  'Next Meal Guesser': {
    Hindi: 'अगला भोजन अनुमान', Assamese: 'পৰৱৰ্তী আহাৰৰ অনুমান', Bengali: 'পরবর্তী খাবারের অনুমান'
  },
  'Medication Organizer': {
    Hindi: 'दवा आयोजक', Assamese: 'ঔষধ সংগঠক', Bengali: 'ওষুধ সংগঠক'
  },
  'Bedtime Steps': {
    Hindi: 'सोने के समय के कदम', Assamese: 'শুবলৈ যোৱাৰ পদক্ষেপ', Bengali: 'ঘুমানোর পদক্ষেপ'
  },
  'Event Sequencer': {
    Hindi: 'घटना अनुक्रमक', Assamese: 'ঘটনা অনুক্ৰমক', Bengali: 'ইভেন্ট সিকোয়েন্সার'
  },
  'Language & Words': {
    Hindi: 'भाषा और शब्द', Assamese: 'ভাষা আৰু শব্দ', Bengali: 'ভাষা ও শব্দ'
  },
  'Name the Object': {
    Hindi: 'वस्तु का नाम बताएं', Assamese: 'বস্তুটোৰ নাম কওক', Bengali: 'বস্তুর নাম বলুন'
  },
  'Word Association': {
    Hindi: 'शब्द संघ', Assamese: 'শব্দৰ সম্পৰ্ক', Bengali: 'শব্দ অনুষঙ্গ'
  },
  'Complete the Sentence': {
    Hindi: 'वाक्य पूरा करें', Assamese: 'বাক্যটো সম্পূৰ্ণ কৰক', Bengali: 'বাক্যটি সম্পূর্ণ করুন'
  },
  'Rhyme Time': {
    Hindi: 'कविता का समय', Assamese: 'ছন্দৰ সময়', Bengali: 'ছন্দের সময়'
  },
  'Spell your Name': {
    Hindi: 'अपना नाम लिखें', Assamese: 'আপোনাৰ নাম লিখক', Bengali: 'আপনার নাম বানান'
  },
  'Story Completion': {
    Hindi: 'कहानी पूरी करना', Assamese: 'কাহিনী সম্পূৰ্ণ কৰা', Bengali: 'গল্প সমাপ্তি'
  }
};

const languages = ['English', 'Hindi', 'Assamese', 'Bengali', 'Bodo', 'Manipuri', 'Khasi', 'Garo', 'Mizo', 'Nepali'];

for (const lang of languages) {
  let langBlock = "";
  for (const [enKey, transObj] of Object.entries(translations)) {
    // Escape single quotes in the English key
    const safeKey = enKey.includes("'") ? `"${enKey}"` : `'${enKey}'`;
    
    let val = enKey;
    if (transObj[lang]) {
      val = transObj[lang];
    }
    
    // Escape single quotes in the value
    const safeVal = val.replace(/'/g, "\\'");
    
    langBlock += `    ${safeKey}: '${safeVal}',\n`;
  }
  
  const regex = new RegExp(`('${lang}'|${lang}):\\s*\\{([\\s\\S]*?)\\n\\s*\\}`, 'g');
  content = content.replace(regex, (match, p1, p2) => {
    return `'${lang}': {${p2},\n${langBlock}  }`;
  });
}

fs.writeFileSync(path, content, 'utf8');
console.log('Updated Games in i18n.js');
