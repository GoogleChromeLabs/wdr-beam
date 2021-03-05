import * as path from 'path';
import * as fs from 'fs';

import {uploadFile} from '../upload';

export const caseHtml = async (
  markdown: string,
  file: string,
  domain: Domains,
  uid: string,
  imageCache: ImageCahce
): Promise<MarkdownResults> => {
  const imageMatchRegex = /<img+[^>]*src="((?!http?).*\\*.(png|svg|jpg|jpeg|gif|webp))"+[^>]*alt="(.*?)"[^>]*>/g;
  const imageRegexGroup = /<img+[^>]*src="(?<src>((?!http?).*\\*.(png|svg|jpg|jpeg|gif|webp)))"+[^>]*alt="(?<alt>(.*?))"[^>]*>/;
  const images = markdown.match(imageMatchRegex);
  const result: MarkdownResults = {i: 0, markdown};

  // check if images are in file
  if (images) {
    const markdownPath = path.dirname(file);

    // go through each image found
    for (const image of images) {
      // extract image details
      const groups = imageRegexGroup.exec(image)?.groups;

      // ensure image src exist
      if (groups && groups.src) {
        const imageFileName = groups.src.split('/').pop() || '';
        const srcPath = path.join(markdownPath, imageFileName);

        // check if image file exists
        if (fs.existsSync(srcPath)) {
          result.i++;
          const upload = await uploadFile(srcPath, domain, uid);
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
