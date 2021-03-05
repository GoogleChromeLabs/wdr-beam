#!/usr/bin/env node
import dccUploader from './index';
import {Command} from 'commander';
import * as readlineSync from 'readline-sync';

const packageJson = require('../package.json');
const program = new Command();
const requiredArgs: {
  key: 'domain' | 'filepath' | 'token';
  question: string;
  options?: TODO[];
}[] = [
  {
    key: 'domain',
    question: "Please provide a domain for the site you're uploading to:\n",
    options: ['developer.chrome.com', 'web.dev'],
  },
  {key: 'filepath', question: 'What directory are we uploading for:\n'},
  {
    key: 'token',
    question:
      'Please provide an auth token: (https://chrome-gcs-uploader.web.app/cli)\n',
  },
];

program
  .name(packageJson.name)
  .version(packageJson.version)
  .option(
    '-d, --domain <string>',
    'domain of site uploading for, developer.chrome.com or web.dev'
  )
  .option('-f, --filepath <string>', 'directory to search in', process.cwd())
  .option('-t, --token <string>', 'auth token');

program.parse(process.argv);

const options = program.opts() as DCCUploaderArgs;

for (const arg of requiredArgs) {
  while (!options[arg.key]) {
    if (arg.options) {
      const i = readlineSync.keyInSelect(arg.options, arg.question, {
        cancel: false,
      }) as TODO;
      options[arg.key] = arg.options[i];
    } else {
      options[arg.key] = readlineSync.question(arg.question) as TODO;
    }
  }
}

dccUploader(options);
