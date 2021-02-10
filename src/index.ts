import * as glob from 'glob';
import * as path from 'path';
import * as process from 'process';
import * as fs from 'fs';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';
global.XMLHttpRequest = require('xmlhttprequest-ssl').XMLHttpRequest;

firebase.initializeApp({
  apiKey: 'AIzaSyBSBTYO-WYjfx_CicY_r0I-5qGoyj2K7hA',
  authDomain: 'chrome-gcs-uploader.firebaseapp.com',
  databaseURL: 'https://chrome-gcs-uploader.firebaseio.com',
  projectId: 'chrome-gcs-uploader',
  storageBucket: 'chrome-gcs-uploader.appspot.com',
  messagingSenderId: '561384360906',
  appId: '1:561384360906:web:e838a6ec0de9369989dd33',
});

import {getWorkingDirectory} from './utils';
import {uploadFile} from './upload';

const imageMatchRegex = /!\[(.*)\]\((?!http?).*\\*.(png|svg|jpg|jpeg|gif|webp)\)/g;
const imageRegexGroup = /!\[(?<alt>(.*))\]\((?<src>(?!http?).*\.(png|svg|jpg|jpeg|gif|webp))\)/;

export default async (filepath = process.cwd()): Promise<void> => {
  const workingDirectory = getWorkingDirectory(filepath);
  const mdGlob = path.join(workingDirectory, '!(node_modules)', '**', '*.md');

  glob(mdGlob, {}, async (_, files) => {
    let i = 0;
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
              const upload = await uploadFile(srcPath);
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
    process.exit(0); // eslint-disable-line
  });
};
