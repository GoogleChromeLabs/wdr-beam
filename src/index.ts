import * as glob from 'glob';
import * as path from 'path';
import * as process from 'process';
import * as fs from 'fs';
import firebase from 'firebase/app';
import * as readlineSync from 'readline-sync';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
global.XMLHttpRequest = require('xmlhttprequest-ssl').XMLHttpRequest;

import {environment} from './environment';
import {getWorkingDirectory} from './utils';
import {caseHtmlClass} from './regex-cases/html-class';
import {caseHtml} from './regex-cases/html';
import {caseMarkdown} from './regex-cases/markdown';

const close = (code: number) => process.exit(code); // eslint-disable-line

export default async ({
  filepath = process.cwd(),
  token,
}: DCCUploaderArgs): Promise<void> => {
  let uid: string;
  // Validate domain and set up Firebase
  try {
    firebase.initializeApp(environment);
  } catch (e: TODO) {
    console.error(e.message ? e.message : e);
    close(1);
  }

  // Firebase sign in
  try {
    const user = (await firebase.auth().signInWithCustomToken(token)).user;
    if (user) {
      uid = user.uid;
    } else {
      console.error('No user found');
      close(1);
    }
  } catch {
    console.error(
      "Invalid token, we can't authorize you. Visit https://web-dev-uploads.web.app/cli and try again!"
    );
    close(1);
  }

  // Get working directory and make glob
  const workingDirectory = getWorkingDirectory(filepath);
  const mdGlob = path.join(workingDirectory, '**', '*.md');

  // Verify folder before we continue
  const verifyFolder = readlineSync.keyInYNStrict(
    `Uploading files from ${workingDirectory}, should we proceed?`
  );
  if (!verifyFolder) {
    close(0);
  }

  glob(mdGlob, {}, async (_, files) => {
    const ic: ImageCahce = new Map();
    files = files.filter(v => !v.includes('node_modules'));

    // Go through all the files that were found
    for (const file of files) {
      console.log('\nExtraxting images from:', file);
      let md = fs.readFileSync(file, 'utf8');

      // Upload HTML with a class attribute
      const resultHtmlClass = await caseHtmlClass(md, file, uid, ic);
      md = resultHtmlClass.markdown;

      // Upload HTML without a class attribute
      const resultHtml = await caseHtml(md, file, uid, ic);
      md = resultHtml.markdown;

      // Upload markdown syntax
      const resultMarkdown = await caseMarkdown(md, file, uid, ic);
      md = resultMarkdown.markdown;

      const uploadedFiles = resultHtmlClass.i + resultHtml.i + resultMarkdown.i;
      if (uploadedFiles > 0) {
        console.log(`Found ${uploadedFiles} image(s)`);
        console.log(`Updating: ${file}`);
        fs.writeFileSync(file, md, 'utf8');
      }
    }
    console.log(`\nUploaded ${ic.size} file(s)`);
    close(0);
  });
};
