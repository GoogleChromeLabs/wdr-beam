#!/usr/bin/env node
import dccUploader from './index';

const [, , filepath] = process.argv;

dccUploader(filepath);
