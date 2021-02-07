import * as path from 'path';

export const getWorkingDirectory = (filepath: string): string =>
  path.isAbsolute(filepath) ? filepath : path.join(process.cwd(), filepath);
