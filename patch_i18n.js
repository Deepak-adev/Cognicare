const fs = require('fs');
const path = './src/utils/i18n.js';
let content = fs.readFileSync(path, 'utf8');

const newKeys = {
  English: `
    breakfast: 'Breakfast',
    morningMedicine: 'Morning Medicine',
    cognitiveActivity: 'Cognitive Activity',
    lunch: 'Lunch',
    nextUp: 'Next up!',
    myDay: 'My Day',
    library: 'Library',
    settings: 'Settings'
  `,
  Hindi: `
    breakfast: 'नाश्ता',
    morningMedicine: 'सुबह की दवा',
    cognitiveActivity: 'संज्ञानात्मक गतिविधि',
    lunch: 'दोपहर का भोजन',
    nextUp: 'अगला!',
    myDay: 'मेरा दिन',
    library: 'पुस्तकालय',
    settings: 'सेटिंग्स'
  `,
  Assamese: `
    breakfast: 'পুৱাৰ আহাৰ',
    morningMedicine: 'ৰাতিপুৱাৰ ঔষধ',
    cognitiveActivity: 'জ্ঞানীয় কাৰ্যকলাপ',
    lunch: 'দুপৰীয়াৰ আহাৰ',
    nextUp: 'পৰৱৰ্তী!',
    myDay: 'মোৰ দিন',
    library: 'পুথিভঁৰাল',
    settings: 'ছেটিংছ'
  `,
  Bengali: `
    breakfast: 'প্রাতঃরাশ',
    morningMedicine: 'সকালের ওষুধ',
    cognitiveActivity: 'জ্ঞানীয় কার্যকলাপ',
    lunch: 'দুপুরের খাবার',
    nextUp: 'পরবর্তী!',
    myDay: 'আমার দিন',
    library: 'গ্রন্থাগার',
    settings: 'সেটিংস'
  `,
  Bodo: `
    breakfast: 'फुंनि जामुं',
    morningMedicine: 'फुंनि मुलि',
    cognitiveActivity: 'गोसोनि हाबाफारि',
    lunch: 'सानजौसेनि जामुं',
    nextUp: 'उननि!',
    myDay: 'आंनि सान',
    library: 'बिजाबखं',
    settings: 'सेटिंफोर'
  `,
  Manipuri: `
    breakfast: 'অয়ুক্কী চীঞ্জাক',
    morningMedicine: 'অয়ুক্কী হিদাক',
    cognitiveActivity: 'কগনিটিভ এক্সারসাইজ',
    lunch: 'নুংথিলগী চীঞ্জাক',
    nextUp: 'মথংগী!',
    myDay: 'ঐগী নুমীৎ',
    library: 'লাইব্রেরী',
    settings: 'সেটিংস'
  `,
  Khasi: `
    breakfast: 'Ja step',
    morningMedicine: 'Dawai step',
    cognitiveActivity: 'Kam Pynleit Mynsiem',
    lunch: 'Ja sngi',
    nextUp: 'Ka ba bud!',
    myDay: 'Ka Sngi Jong Nga',
    library: 'Library',
    settings: 'Settings'
  `,
  Garo: `
    breakfast: 'Pringni cha.ani',
    morningMedicine: 'Pringni sam',
    cognitiveActivity: 'Gisikni kam',
    lunch: 'Saljatini cha.ani',
    nextUp: 'Ja.mano!',
    myDay: 'Angni Sal',
    library: 'Library',
    settings: 'Settings'
  `,
  Mizo: `
    breakfast: 'Tukthuan',
    morningMedicine: 'Tuking damdawi',
    cognitiveActivity: 'Hriatna exercise',
    lunch: 'Chhunthawh',
    nextUp: 'A dawt!',
    myDay: 'Ka Ni',
    library: 'Library',
    settings: 'Settings'
  `,
  Nepali: `
    breakfast: 'बिहानको खाजा',
    morningMedicine: 'बिहानको औषधि',
    cognitiveActivity: 'संज्ञानात्मक गतिविधि',
    lunch: 'दिउँसोको खाना',
    nextUp: 'अर्को!',
    myDay: 'मेरो दिन',
    library: 'पुस्तकालय',
    settings: 'सेटिङ्हरू'
  `
};

for (const [lang, keys] of Object.entries(newKeys)) {
  // Find the end of the language block
  const regex = new RegExp(`('${lang}'|${lang}):\\s*\\{([\\s\\S]*?)\\n\\s*\\}`, 'g');
  content = content.replace(regex, (match, p1, p2) => {
    // p2 contains all the keys.
    // Append our new keys before the closing brace.
    return `'${lang}': {${p2},\n${keys}\n  }`;
  });
}

fs.writeFileSync(path, content, 'utf8');
console.log('Updated i18n.js');
