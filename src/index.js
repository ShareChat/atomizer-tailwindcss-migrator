#!/usr/bin/env node

import path from 'path';
import open from 'open';
import { readFile, writeFile } from 'fs/promises';
import { Command } from 'commander';
import tranformFile from './lib/replacer.js';
import { globSync } from 'glob';
import { extractClasses } from './helpers/index.js';
import generateHTMLReport from './helpers/html.js';
import loadPlugins from './helpers/plugin.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const packageJson = require('../package.json');

const currentTime = performance.now();

const program = new Command();

program
  .name('tailwind-migrator')
  .description('CLI to migrate files from atomizer to tailwindcss')
  .version(packageJson.version);

program
  .requiredOption(
    '-s, --style <file>',
    'stylesheet file to use for picking up atomizer classes'
  )
  .requiredOption('-t, --transform <globPattern>', 'files to transform')
  .option('-p, --plugins <file>', 'plugins file to use for custom transforms')
  .option('-m, --mappings <file>', 'mappings file to use for custom variables')
  .option('-d, --dry-run', 'dry run to see the changes')
  .option('-no, --no-open', 'do not open the report file');

program.parse();

const options = program.opts();

let styleFile = null;

let filePattern = null;

let mappingsFile = null;

if (options.style) {
  styleFile = options.style;
}

if (options.transform) {
  filePattern = options.transform;
}

if (options.mappings) {
  mappingsFile = options.mappings;
}

let plugins = [];

if (options.plugins) {
  plugins = await loadPlugins(options.plugins);
}

const isDryRun = options.dryRun;

async function main(styleFilePath, filePattern) {
  const styles = await readFile(styleFilePath, { encoding: 'utf-8' });
  const filePaths = globSync(filePattern);
  console.log(`Found ${filePaths.length} files`);
  let mappings = {};
  if (mappingsFile) {
    mappings = JSON.parse(await readFile(mappingsFile, { encoding: 'utf-8' }));
  }
  const allClasses = extractClasses(styles);
  const promises = filePaths.map(async (file) => {
    const content = await readFile(file, { encoding: 'utf-8' });
    console.log('Transforming: ', file);
    const {
      atomicClassesCount,
      code,
      classesTransformedCount,
      transformedClasses,
      notTransformedClasses,
    } = await tranformFile(allClasses, content, plugins, mappings);
    if (!isDryRun) {
      await writeFile(file, code);
    }
    return {
      fileName: file,
      file: path.resolve(file),
      atomicClassesCount,
      classesTransformedCount,
      transformedClasses,
      notTransformedClasses,
    };
  });
  const transformReport = await Promise.all(promises);

  const totalAtomicClasses = transformReport.reduce(
    (acc, { atomicClassesCount }) => acc + atomicClassesCount,
    0
  );
  const totalTransformedClasses = transformReport.reduce(
    (acc, { classesTransformedCount }) => acc + classesTransformedCount,
    0
  );

  await writeFile(
    'transform-report.html',
    generateHTMLReport(
      transformReport,
      totalAtomicClasses,
      totalTransformedClasses
    )
  );

  const timeTaken = performance.now() - currentTime;

  console.log(
    'Total time taken: ',
    `${timeTaken.toFixed(2)}ms`,
    `${(timeTaken / 1000).toFixed(2)}s`
  );

  if (!options.open) {
    return;
  }

  await open('transform-report.html');
}

main(styleFile, filePattern);
