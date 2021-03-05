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

import {getEnvironments} from './environment';
import {getWorkingDirectory} from './utils';
import {uploadFile} from './upload';

const imageMatchRegex = /!\[(.*)\]\((?!http?).*\\*.(png|svg|jpg|jpeg|gif|webp)\)/g;
const imageRegexGroup = /!\[(?<alt>(.*))\]\((?<src>(?!http?).*\.(png|svg|jpg|jpeg|gif|webp))\)/;

const close = (code: number) => process.exit(code); // eslint-disable-line

export default async ({
  domain,
  filepath = process.cwd(),
  token,
}: DCCUploaderArgs): Promise<void> => {
  let uid: string;
  // Validate domain and set up Firebase
  try {
    const environment = getEnvironments(domain);
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
    console.error("Invalid token, we can't authorize you");
    close(1);
  }

  // Get working directory and make glob
  const workingDirectory = getWorkingDirectory(filepath);
  const mdGlob = path.join(workingDirectory, '**', '*.md');

  // Verify folder before we continue
  const verifyFolder = readlineSync.keyInYNStrict(
    `Uploading files from ${workingDirectory}, is that ok?`
  );
  if (!verifyFolder) {
    close(0);
  }

  glob(mdGlob, {}, async (_, files) => {
    let i = 0;
    files = files.filter(v => !v.includes('node_modules'));

    // Go through all the files that were found
    for (const file of files) {
      let markdown = fs.readFileSync(file, 'utf8');
      const images = markdown.match(imageMatchRegex);

      // check if images are in file
      if (images) {
        console.log('Extraxting images from:', file);
        const markdownPath = path.dirname(file);

        // go through each image found
        for (const image of images) {
          // extract image details
          const groups = imageRegexGroup.exec(image)?.groups;

          // ensure all image details exist
          if (groups && groups.alt && groups.src) {
            const imageFileName = groups.src.split('/').pop() || '';
            const srcPath = path.join(markdownPath, imageFileName);

            // check if image file exists
            if (fs.existsSync(srcPath)) {
              i++;
              const upload = await uploadFile(srcPath, domain, uid);
              const shortcode = `{% Img src="${upload.src}", alt="${groups.alt}", width="${upload.width}", height="${upload.height}" %}`;
              markdown = markdown.replace(image, shortcode);
            }
          }
        }
        console.log(`Updating: ${file}`);
        fs.writeFileSync(file, markdown, 'utf8');
      }
    }
    console.log(`Uploaded ${i} file(s)`);
    close(0);
  });
};
