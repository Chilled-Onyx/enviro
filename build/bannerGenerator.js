#!/usr/bin/env node

const figlet        = require('figlet');
const { writeFile } = require('fs/promises');
const bannerText    = `ENViro v${require('../package.json').version}`;

process.stdout.write(`ℹ️  - Banner generating for ${bannerText} ...\n`);

figlet.text(
  bannerText,
  'Standard',
  async (figletError, text) => {
    if(null !== figletError) {
      process.stdout.write(`❌ - Error generating banner - ${figletError}\n`);
      return;
    }

    const writeArray  = [];
    const bannerLines = text.split('\n');
    const maxLen      = bannerLines.map(line => line.length).reduce((pv, cv) => Math.max(pv, cv))+2;
    const blankLine   = '║'+' '.repeat(maxLen)+'║';

    writeArray.push('╔'+'═'.repeat(maxLen)+'╗');
    writeArray.push(blankLine);

    bannerLines.forEach(line => writeArray.push(`║ ${line} ║`));

    writeArray.push(blankLine);
    writeArray.push('╚'+'═'.repeat(maxLen)+'╝');

    writeArray.push('');
    writeArray.push('');

    try {
      await writeFile('dist/banner.txt', writeArray.join('\n'), 'utf-8');
      process.stdout.write('✅ - Banner generated.\n');
    } catch(writeError) {
      process.stdout.write(`❌ - Error generating banner - ${writeError}\n`);
    }
  }
);