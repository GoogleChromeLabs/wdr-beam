import * as glob from 'glob';
import * as path from 'path';
import * as fs from 'fs';

import {getWorkingDirectory} from './utils';

const libName = require('../package.json').name;
const imageMatchRegex = /!\[(.*)\]\((?!http?).*\\*.(png|svg|jpg|jpeg)\)/g;
const imageRegexGroup = /!\[(?<alt>(.*))\]\((?<src>(?!http?).*\.(png|svg|jpg|jpeg))\)/;

export default async (filepath = process.cwd()): Promise<void> => {
  const workingDirectory = getWorkingDirectory(filepath);
  const outputFolder = path.join(workingDirectory, `${libName}-temp`);
  const mdGlob = path.join(workingDirectory, '!(node_modules)', '**', '*.md');

  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
  }

  glob(mdGlob, {}, async (_, files) => {
    // Go through all the files that were found
    for (const file of files) {
      const markdown = fs.readFileSync(file, 'utf8');
      const images = markdown.match(imageMatchRegex);

      // check if images are in file
      if (images) {
        console.log(
          'Extraxting images from:',
          file.replace(workingDirectory, '')
        );
        const markdownPath = path.dirname(file);

        // go through each image found
        for (const image of images) {
          // extract image details
          const groups = imageRegexGroup.exec(image)?.groups;

          // ensure all image details exist
          if (groups && groups.alt && groups.src) {
            const imageFileName = groups.src.split('/').pop() || '';
            const srcPath = path.join(markdownPath, imageFileName);
            const outputPath = path.join(outputFolder, imageFileName);

            // check if image file exists
            if (fs.existsSync(srcPath)) {
              // fs.createReadStream(srcPath).pipe(
              //   fs.createWriteStream(outputPath)
              // );
            }
          }
        }
      }
    }
  });
};
