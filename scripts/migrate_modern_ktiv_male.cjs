#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');

// Словарь канонических замен: архаичная форма с кубуцем без вав -> нормативная форма כתיב מלא
const REPLACEMENTS = [
  // מעולה (me'ule / me'ula / me'ulim / me'ulot)
  { from: /מְעֻלֶּה/g, to: 'מְעוּלֶּה' },
  { from: /מְעֻלָּה/g, to: 'מְעוּלָּה' },
  { from: /מְעֻלִּים/g, to: 'מְעוּלִּים' },
  { from: /מְעֻלּוֹת/g, to: 'מְעוּלּוֹת' },

  // מצוין (metzuyan / metzuyenet / metzuyanim / metzuyanot)
  { from: /מְצֻיָּן/g, to: 'מְצוּיָּן' },
  { from: /מְצֻיֶּנֶת/g, to: 'מְצוּיֶּנֶת' },
  { from: /מְצֻיָּנִים/g, to: 'מְצוּיָּנִים' },
  { from: /מְצֻיָּנוֹת/g, to: 'מְצוּיָּנוֹת' },

  // סוכר (sukar)
  { from: /סֻכָּר/g, to: 'סוּכָּר' },

  // חולצה (chultza / chultzot)
  { from: /חֻלְצָה/g, to: 'חוּלְצָה' },
  { from: /חֻלְצוֹת/g, to: 'חוּלְצוֹת' },

  // שותף (shutaf / shutafa / shutafim / shutafot)
  { from: /שֻׁתָּף/g, to: 'שׁוּתָּף' },
  { from: /שֻׁתָּפָה/g, to: 'שׁוּתָּפָה' },
  { from: /שֻׁתָּפִים/g, to: 'שׁוּתָּפִים' },
  { from: /שֻׁתָּפוֹת/g, to: 'שׁוּתָּפוֹת' },

  // מיוחד (meyuchad / meyuchedet / meyuchadim / meyuchadot)
  { from: /מְיֻחָד/g, to: 'מְיוּחָד' },
  { from: /מְיֻחֶדֶת/g, to: 'מְיוּחֶדֶת' },
  { from: /מְיֻחָדִים/g, to: 'מְיוּחָדִים' },
  { from: /מְיֻחָדוֹת/g, to: 'מְיוּחָדוֹת' },

  // כולם (kulam / kulanu / kulchem / kulan / kulo / kulah)
  { from: /לְכֻלָּם/g, to: 'לְכוּלָּם' },
  { from: /כֻּלָּם/g, to: 'כּוּלָּם' },
  { from: /כֻּלָּנוּ/g, to: 'כּוּלָּנוּ' },
  { from: /כֻּלְּכֶם/g, to: 'כּוּלְּכֶם' },
  { from: /כֻּלָּן/g, to: 'כּוּלָּן' },
  { from: /כֻּלּוֹ/g, to: 'כּוּלּוֹ' },
  { from: /כֻּלָּהּ/g, to: 'כּוּלָּהּ' },

  // מטופל (metupal / metupelet)
  { from: /מְטֻפָּל/g, to: 'מְטוּפָּל' },
  { from: /מְטֻפֶּלֶת/g, to: 'מְטוּפֶּלֶת' },

  // כותנה (kutna)
  { from: /כֻּתְנָה/g, to: 'כּוּתְנָה' },

  // קופסה (kufsa)
  { from: /הַקֻּפָּה/g, to: 'הַקּוּפָּה' },
  { from: /לַקֻּפָּה/g, to: 'לַקּוּפָּה' },
  { from: /מִקֻּפַּת/g, to: 'מִקּוּפַּת' },
  { from: /קֻפַּת/g, to: 'קוּפַּת' },
  { from: /קֻפְסָה/g, to: 'קוּפְסָה' },
  { from: /קֻפְסַת/g, to: 'קוּפְסַת' },
  { from: /קֻפְסָאוֹת/g, to: 'קוּפְסָאוֹת' },

  // חופשה (chufsha)
  { from: /חֻפְשָׁה/g, to: 'חוּפְשָׁה' },
  { from: /חֻפְשׁוֹת/g, to: 'חוּפְשׁוֹת' },

  // מומלץ (mumlatz / mumletzet)
  { from: /מֻמְלָץ/g, to: 'מוּמְלָץ' },
  { from: /מֻמְלֶצֶת/g, to: 'מוּמְלֶצֶת' },
  { from: /מֻמְלָצִים/g, to: 'מוּמְלָצִים' },
  { from: /מֻמְלָצוֹת/g, to: 'מוּמְלָצוֹת' },

  // אולפן (ulpan)
  { from: /אֻלְפָּן/g, to: 'אוּלְפָּן' },

  // שולחן (shulchan)
  { from: /הַשֻּׁלְחָן/g, to: 'הַשּׁוּלְחָן' },
  { from: /שֻׁלְחָן/g, to: 'שׁוּלְחָן' },
  { from: /שֻׁלְחָנוֹת/g, to: 'שׁוּלְחָנוֹת' },

  // מוכן (muchan)
  { from: /מֻכָּן/g, to: 'מוּכָּן' },
  { from: /מֻכָּנָה/g, to: 'מוּכָּנָה' },
  { from: /מֻכָּנִים/g, to: 'מוּכָּנִים' },
  { from: /מֻכָּנוֹת/g, to: 'מוּכָּנוֹת' },

  // מוסכם (muskam)
  { from: /מֻסְכָּם/g, to: 'מוּסְכָּם' },

  // תוכנית (tochnit)
  { from: /תָּכְנִית/g, to: 'תּוֹכְנִית' },
  { from: /תַּכְנִית/g, to: 'תּוֹכְנִית' },

  // מוקדם (mukdam)
  { from: /מֻקְדָּם/g, to: 'מוּקְדָּם' },

  // מופתע (mufta)
  { from: /מֻפְתָּע/g, to: 'מוּפְתָּע' },
  { from: /מֻפְתַּעַת/g, to: 'מוּפְתַּעַת' },

  // מושלם (mushlam)
  { from: /מֻשְׁלָם/g, to: 'מוּשְׁלָם' },
  { from: /מֻשְׁלֶמֶת/g, to: 'מוּשְׁלֶמֶת' },

  // עוגה (uga)
  { from: /עֻגָה/g, to: 'עוּגָה' },
  { from: /עֻגָּה/g, to: 'עוּגָה' },

  // Цвета и свойства (משקל קָטֹל)
  { from: /אֲדֻמָּה/g, to: 'אֲדוּמָּה' },
  { from: /אֲדֻמּוֹת/g, to: 'אֲדוּמּוֹת' },
  { from: /אֲדֻמִּים/g, to: 'אֲדוּמִּים' },
  { from: /יְרֻקָּה/g, to: 'יְרוּקָּה' },
  { from: /יְרֻקּוֹת/g, to: 'יְרוּקּוֹת' },
  { from: /כְּחֻלָּה/g, to: 'כְּחוּלָּה' },
  { from: /כְּחֻלִּים/g, to: 'כְּחוּלִּים' },
  { from: /כְּחֻלּוֹת/g, to: 'כְּחוּלּוֹת' },
  { from: /צְהֻבָּה/g, to: 'צְהוּבָּה' },
  { from: /יְרֻקִּים/g, to: 'יְרוּקִּים' },
  { from: /צְהֻבִּים/g, to: 'צְהוּבִּים' },
  { from: /סֻפְגָּנִיּוֹת/g, to: 'סוּפְגָּנִיּוֹת' },
  { from: /הֻסְדַּר/g, to: 'הוּסְדַּר' },
  { from: /יֻסְדַּר/g, to: 'יוּסְדַּר' },
  { from: /"מֻזְמָן"/g, to: '"מוּזְמָן"' },
  { from: /מֻזְמָן/g, to: 'מוּזְמָן' },
  // Причастия и прилагательные пуаль / хуфъаль
  { from: /מְאֻחָר/g, to: 'מְאוּחָר' },
  { from: /מְבֻגָּר/g, to: 'מְבוּגָּר' },
  { from: /מְלֻמָּד/g, to: 'מְלוּמָּד' },
  { from: /מְנֻקָּד/g, to: 'מְנוּקָּד' },
  { from: /מְסֻדָּר/g, to: 'מְסוּדָּר' },
  { from: /מְפֻרְסָמִים/g, to: 'מְפוּרְסָמִים' },
  { from: /מְקֻלְקֶלֶת/g, to: 'מְקוּלְקֶלֶת' },
  { from: /מְרֻהֶטֶת/g, to: 'מְרוּהֶטֶת' },
  { from: /וּמְבֻסָּס/g, to: 'וּמְבוּסָּס' },
  { from: /הַמְּעֻנְיָן/g, to: 'הַמְּעוּנְיָן' },
  { from: /מוּזְמָנִים/g, to: 'מוּזְמָנִים' },
  { from: /מֻזְמָנִים/g, to: 'מוּזְמָנִים' },
  { from: /הַמֻּמְחִים/g, to: 'הַמּוּמְחִים' },
  { from: /מֻמְחִים/g, to: 'מוּמְחִים' },
  { from: /מֻסְדָּר/g, to: 'מוּסְדָּר' },
  { from: /הַמֻּדְרָךְ/g, to: 'הַמּוּדְרָךְ' },
  { from: /הַמֻּצָּר/g, to: 'הַמּוּצָּר' },
  { from: /מֻרְכָּב/g, to: 'מוּרְכָּב' },
  { from: /מֻרְכָּבוֹת/g, to: 'מוּרְכָּבוֹת' },
  { from: /מֻשָּׂג/g, to: 'מוּשָּׂג' },
  { from: /מֻתְפָּלִים/g, to: 'מוּתְפָּלִים' },

  // Существительные
  { from: /בֵּינְלְאֻמִּיּוֹת/g, to: 'בֵּינְלְאוּמִּיּוֹת' },
  { from: /הַלְּאֻמִּי/g, to: 'הַלְּאוּמִּי' },
  { from: /לְאֻמִּי/g, to: 'לְאוּמִּי' },
  { from: /זְכֻיּוֹת/g, to: 'זְכוּיוֹת' },
  { from: /חֲלֻקָּה/g, to: 'חֲלוּקָּה' },
  { from: /חֲנֻכִּיָּה/g, to: 'חֲנוּכִּיָּה' },
  { from: /חֲנֻכַּת/g, to: 'חֲנוּכַּת' },
  { from: /לַחֲתֻנָּה/g, to: 'לַחֲתוּנָּה' },
  { from: /חֲתֻנּוֹת/g, to: 'חֲתוּנּוֹת' },
  { from: /חֻקִּים/g, to: 'חוּקִּים' },
  { from: /חֻקֵּי/g, to: 'חוּקֵּי' },
  { from: /לִנְקֻדּוֹת/g, to: 'לִנְקוּדּוֹת' },
  { from: /נְקֻדּוֹת/g, to: 'נְקוּדּוֹת' },
  { from: /הֻלֶּדֶת/g, to: 'הוּלֶּדֶת' },

  // Глаголы пассивного прошедшего времени (пуаль / хуфъаль)
  { from: /דֻּבַּר/g, to: 'דּוּבַּר' },
  { from: /סֻדַּר/g, to: 'סוּדַּר' },
  { from: /פֻּעַל/g, to: 'פּוּעַל' },
  { from: /שֻׁלַּם/g, to: 'שׁוּלַּם' },
  { from: /שֻׁפַּץ/g, to: 'שׁוּפַּץ' },
  { from: /וְהֻפְעַל/g, to: 'וְהוּפְעַל' },
  { from: /הֻפְעַל/g, to: 'הוּפְעַל' },
  { from: /הֻשְׁלַם/g, to: 'הוּשְׁלַם' },
  { from: /הֻתְחַל/g, to: 'הוּתְחַל' },
];

function getFiles(dir, recursive = true) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && recursive && entry.name !== 'node_modules' && entry.name !== '.next') {
      files.push(...getFiles(fullPath, recursive));
    } else if (entry.isFile() && /\.(ts|tsx|json)$/.test(entry.name)) {
      if (entry.name !== 'database.ts' && !entry.name.startsWith('pealimMaster')) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

function migrate() {
  const allFiles = new Set();
  allFiles.add(path.join(repoRoot, 'src/data/dialogueLessons.ts'));
  allFiles.add(path.join(repoRoot, 'src/data/phoneScenarios.ts'));
  allFiles.add(path.join(repoRoot, 'src/data/essayTopics.ts'));
  allFiles.add(path.join(repoRoot, 'src/data/thematicDecks.ts'));
  allFiles.add(path.join(repoRoot, 'src/data/verbSentencesData.ts'));
  
  for (const d of [path.join(repoRoot, 'src/data/dialogues'), path.join(repoRoot, 'src/data/lessons')]) {
    for (const f of getFiles(d, true)) {
      allFiles.add(f);
    }
  }

  let totalReplacements = 0;
  let modifiedFilesCount = 0;

  for (const file of allFiles) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    let fileReplacements = 0;

    for (const r of REPLACEMENTS) {
      const matches = content.match(r.from);
      if (matches) {
        fileReplacements += matches.length;
        content = content.replace(r.from, r.to);
      }
    }

    if (fileReplacements > 0) {
      fs.writeFileSync(file, content, 'utf8');
      modifiedFilesCount++;
      totalReplacements += fileReplacements;
      console.log(`[UPDATED] ${path.relative(repoRoot, file)} (${fileReplacements} замен)`);
    }
  }

  console.log(`\n🎉 Миграция завершена: выполнено ${totalReplacements} замен в ${modifiedFilesCount} файлах.`);
}

migrate();
