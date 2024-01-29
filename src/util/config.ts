import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

export const getConfig = (configFilePath: string): any => {
  const resolvedFilePath = path.resolve(process.cwd(), configFilePath);
  const configFile = fs.readFileSync(resolvedFilePath, 'utf-8');
  return yaml.load(configFile);
};
