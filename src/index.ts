import * as glob from 'glob';
import * as path from 'path';

import {getWorkingDirectory} from './utils';

export default async (filepath = process.cwd()): Promise<void> => {
  const workingDirectory = getWorkingDirectory(filepath);
  const schemasGlob = path.join(workingDirectory, '**', '*.md');

  glob(schemasGlob, {}, async (_, files) => {
    for (const file of files) {
      console.log(file);
    }
  });
};
