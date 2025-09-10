import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

// Carrega o arquivo YAML
const swaggerDocument = yaml.load(
  fs.readFileSync(path.join(__dirname, '../docs/swagger.yaml'), 'utf8')
) as any;

export const specs = swaggerDocument;