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

import firebase from 'firebase/app';
import * as path from 'path';
import * as fs from 'fs';
const sizeOf = require('image-size');
const mime = require('mime-types');

const toArrayBuffer = (buf: Buffer): ArrayBuffer => {
  const ab = new ArrayBuffer(buf.length);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i];
  }
  return ab;
};

const getDimensions = (
  height: number,
  width: number
): {height: number; width: number} => {
  const maxWidth = 800;
  if (width > maxWidth) {
    const ratio = maxWidth / width;
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }
  return {height, width};
};

export const uploadFile = (imgPath: string, uid: string): Promise<Upload> => {
  const collectionRef = firebase.firestore().collection('uploads');
  const storageRef = firebase.storage().ref();
  const docRef = collectionRef.doc();
  const src = `image/${uid}/${docRef.id}${path.extname(imgPath)}`;

  const size = sizeOf(imgPath);
  const {height, width} = getDimensions(size.height, size.width);

  const upload: Upload = {
    date: new Date().getTime(),
    extension: path.extname(imgPath).replace(/^\./, ''),
    height,
    name: path.basename(imgPath),
    src,
    type: 'image',
    uid,
    width,
  };

  const image = toArrayBuffer(fs.readFileSync(imgPath));
  const contentType = mime.lookup(path.extname(imgPath));

  return storageRef
    .child(upload.src)
    .put(image, {
      contentType,
    })
    .then(() => {
      fs.unlinkSync(imgPath);
      return docRef.set(upload);
    })
    .catch((e: TODO) => console.log(e))
    .then(() => upload);
};
