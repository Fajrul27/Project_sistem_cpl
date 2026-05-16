
import 'dotenv/config';
import { prisma } from './server/lib/prisma.js';
import fs from 'fs';
import path from 'path';

async function test() {
  console.log('Testing Environment...');
  console.log('PORT:', process.env.PORT);
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  try {
    const userCount = await prisma.user.count();
    console.log('Database Connection: OK (User count: ' + userCount + ')');
  } catch (e) {
    console.error('Database Connection: FAILED', e);
  }

  const pubKeyPath = process.env.JWT_PUBLIC_KEY_PATH || path.resolve(process.cwd(), '../public.key');
  const privKeyPath = process.env.JWT_PRIVATE_KEY_PATH || path.resolve(process.cwd(), '../private.key');

  console.log('Checking Keys...');
  console.log('Public Key Path:', pubKeyPath);
  console.log('Private Key Path:', privKeyPath);

  if (fs.existsSync(pubKeyPath)) {
    console.log('Public Key: EXISTS');
  } else {
    console.log('Public Key: MISSING');
  }

  if (fs.existsSync(privKeyPath)) {
    console.log('Private Key: EXISTS');
  } else {
    console.log('Private Key: MISSING');
  }
}

test();
