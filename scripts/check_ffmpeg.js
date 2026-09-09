const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const cp = require('child_process');
console.log('FFMPEG PATH:', ffmpeg.path);
console.log(cp.execSync(`"${ffmpeg.path}" -version`).toString().slice(0, 120));
