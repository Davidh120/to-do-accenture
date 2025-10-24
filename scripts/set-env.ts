/* eslint-disable no-console */
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const env = {
  apiKey: process.env['FIREBASE_API_KEY'] || '',
  authDomain: process.env['FIREBASE_AUTH_DOMAIN'] || '',
  projectId: process.env['FIREBASE_PROJECT_ID'] || '',
  storageBucket: process.env['FIREBASE_STORAGE_BUCKET'] || '',
  messagingSenderId: process.env['FIREBASE_MESSAGING_SENDER_ID'] || '',
  appId: process.env['FIREBASE_APP_ID'] || '',
  measurementId: process.env['FIREBASE_MEASUREMENT_ID'] || ''
};

const envDir = join(process.cwd(), 'src', 'environments');
if (!existsSync(envDir)) {
  mkdirSync(envDir, { recursive: true });
}

const makeEnvTs = (production: boolean) => `export const environment = {
  production: ${production},
  firebase: {
    apiKey: '${env.apiKey}',
    authDomain: '${env.authDomain}',
    projectId: '${env.projectId}',
    storageBucket: '${env.storageBucket}',
    messagingSenderId: '${env.messagingSenderId}',
    appId: '${env.appId}',
    measurementId: '${env.measurementId}'
  },
  featureFlags: {
    enableCategoryManager: true
  }
};
`;

try {
  const envPath = join(envDir, 'environment.ts');
  const envProdPath = join(envDir, 'environment.prod.ts');
  writeFileSync(envPath, makeEnvTs(false), { encoding: 'utf8' });
  writeFileSync(envProdPath, makeEnvTs(true), { encoding: 'utf8' });
  console.log('Environment files generated successfully.');
} catch (err) {
  console.error('Failed to write environment files:', err);
  process.exit(1);
}
