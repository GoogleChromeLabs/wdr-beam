#!/usr/bin/env node
/*
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import wdrBeam from './index';
import {Command} from 'commander';
import * as readlineSync from 'readline-sync';

const packageJson = require('../package.json');
const program = new Command();
const requiredArgs: {
  key: 'filepath' | 'token';
  question: string;
  options?: TODO[];
}[] = [
  {key: 'filepath', question: 'What directory are we uploading for:\n'},
  {
    key: 'token',
    question:
      'Please provide an auth token: (https://web-dev-uploads.web.app/cli)\n',
  },
];

console.log('Starting Web DevRel Beam');

program
  .name(packageJson.name)
  .version(packageJson.version)
  .option('-F, --filepath <string>', 'directory to search in', process.cwd())
  .option(
    '-T, --token <string>',
    'auth token, you can generate one at https://web-dev-uploads.web.app/cli'
  );

program.parse(process.argv);

const options = program.opts() as DCCUploaderArgs;

for (const arg of requiredArgs) {
  while (!options[arg.key]) {
    if (arg.options) {
      const i = readlineSync.keyInSelect(arg.options, arg.question, {
        cancel: false,
      }) as TODO;
      options[arg.key] = arg.options[i];
      console.log('\n');
    } else {
      options[arg.key] = readlineSync.question(arg.question) as TODO;
      console.log('\n');
    }
  }
}

wdrBeam(options);
