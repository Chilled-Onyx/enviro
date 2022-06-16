#!/usr/bin/env node

const fs = require('fs/promises');
const { fork } = require('child_process');

/**
 * Delete the dist folder if it exists
 * 
 * @returns {Promise<void>}
 */
const deleteDistDirectory = () => {
  return new Promise(async (resolve, reject) => {
    process.stdout.write('ℹ️  - Attempting to delete dist folder...\n');
    try {
      await fs.rm('./dist', {recursive: true});
      process.stdout.write('✅ - Dist directory successfully deleted.\n');
      return resolve();
    } catch {
      return resolve();
    }
  });
};

/**
 * Compile typescript files
 * 
 * @returns {Promise<void>}
 */
const compile = () => {
  return new Promise((resolve, reject) => {
    process.stdout.write('ℹ️  - Compiling TypeScript...\n');

    const errors = [];

    /**
     * For future me...
     * tsc kills the process. Because of this we run in a seperate process to be
     * able to do things once the tsc is finished compiling.
     */
    const compileProcess = fork('node_modules/typescript/lib/tsc', { detached: true, silent: true });
    compileProcess.stdout.on('data', (data) => {
      errors.push(data.toString());
    });

    compileProcess.on('exit', () => {
      if(0 !== errors.length) {
        process.exitCode = 1;
        process.stdout.write('💥 - Compilation errors:\n');

        errors.forEach((error) => {
          process.stdout.write(`❌ - ${error}\n`);
          process.stdout.write('\n');
        });

        return reject();
      }

      return resolve();
    });
  });
};

deleteDistDirectory()
  .then(compile)
  .then(() => {
    process.stdout.write('✅ - Build complete.\n');
  })
  .catch(() => {
    process.stdout.write('💥 - Build failed.');
  });