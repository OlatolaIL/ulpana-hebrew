const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const audioDir = path.resolve(process.cwd(), 'public/audio/sentences');
const allFiles = fs.readdirSync(audioDir)
  .filter(f => f.endsWith('.mp3'))
  .map(f => `public/audio/sentences/${f}`);

console.log(`Total MP3 audio files found: ${allFiles.length}`);

const BATCH_SIZE = 650;
const totalBatches = Math.ceil(allFiles.length / BATCH_SIZE);

for (let b = 0; b < totalBatches; b++) {
  const batchFiles = allFiles.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
  console.log(`\n========================================`);
  console.log(`Processing Batch ${b + 1}/${totalBatches} (${batchFiles.length} files)...`);
  console.log(`========================================`);

  // Write batch file list to a temporary file for git to add via stdin or args
  const tmpListFile = path.resolve(process.cwd(), `.git_batch_${b}.txt`);
  fs.writeFileSync(tmpListFile, batchFiles.join('\n'), 'utf8');

  try {
    console.log(`Staging batch ${b + 1}...`);
    // git add via file list in chunks of 100 to avoid command length limits on Windows
    const CHUNK = 100;
    for (let c = 0; c < batchFiles.length; c += CHUNK) {
      const chunk = batchFiles.slice(c, c + CHUNK);
      execSync(`git add ${chunk.join(' ')}`, { stdio: 'inherit' });
    }

    // Check if there are staged changes
    const diffCheck = execSync('git diff --cached --name-only', { encoding: 'utf8' }).trim();
    if (!diffCheck) {
      console.log(`No new changes in batch ${b + 1}, skipping.`);
      fs.unlinkSync(tmpListFile);
      continue;
    }

    console.log(`Committing batch ${b + 1}/${totalBatches}...`);
    execSync(`git commit -m "feat(audio): deploy Microsoft Edge Neural TTS audio batch ${b + 1}/${totalBatches} (Avri & Hila)"`, { stdio: 'inherit' });

    console.log(`Pushing batch ${b + 1}/${totalBatches} to origin main...`);
    execSync(`git push origin main`, { stdio: 'inherit' });
    console.log(`✅ Batch ${b + 1}/${totalBatches} pushed successfully!`);
  } catch (err) {
    console.error(`❌ Error in batch ${b + 1}:`, err.message);
    if (fs.existsSync(tmpListFile)) fs.unlinkSync(tmpListFile);
    process.exit(1);
  }

  if (fs.existsSync(tmpListFile)) fs.unlinkSync(tmpListFile);
}

console.log('\n🎉 ALL AUDIO BATCHES SUCCESSFULLY PUSHED TO PRODUCTION!');
