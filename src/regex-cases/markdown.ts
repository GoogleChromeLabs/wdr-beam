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

import * as path from 'path';
import * as fs from 'fs';

import {uploadFile} from '../upload';

export const caseMarkdown = async (
  markdown: string,
  file: string,
  uid: string,
  imageCache: ImageCahce
): Promise<MarkdownResults> => {
  const imageMatchRegex = /!\[(.*)\]\((?!http?).*\\*.(png|svg|jpg|jpeg|gif|webp)\)/g;
  const imageRegexGroup = /!\[(?<alt>(.*))\]\((?<src>(?!http?).*\.(png|svg|jpg|jpeg|gif|webp))\)/;
  const images = markdown.match(imageMatchRegex);
  const result: MarkdownResults = {i: 0, markdown};

  // check if images are in file
  if (images) {
    const markdownPath = path.dirname(file);

    // go through each image found
    for (const image of images) {
      // extract image details
      const groups = imageRegexGroup.exec(image)?.groups;

      // ensure all image src exist
      if (groups && groups.src) {
        const imageFileName = groups.src.split('/').pop() || '';
        const srcPath = path.join(markdownPath, imageFileName);

        // check if image file exists
        if (fs.existsSync(srcPath)) {
          result.i++;
          const upload = await uploadFile(srcPath, uid);
          const shortcode = `{% Img src="${upload.src}", alt="${groups.alt}", width="${upload.width}", height="${upload.height}" %}`;
          result.markdown = result.markdown.replace(image, shortcode);
          imageCache.set(srcPath, upload);
          // Check if we've already uploaded this image
        } else if (imageCache.has(srcPath)) {
          const upload = imageCache.get(srcPath) as Upload;
          const shortcode = `{% Img src="${upload.src}", alt="${groups.alt}", width="${upload.width}", height="${upload.height}" %}`;
          result.markdown = result.markdown.replace(image, shortcode);
        }
      }
    }
  }

  return result;
};
