#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
import * as cdk from 'aws-cdk-lib';
import { AppStack } from '../lib/app-stack';

// If NODE_ENV=local, load `.env.local` instead of `.env`
const envFile = process.env.NODE_ENV === 'local' ? `.env.${process.env.NODE_ENV}` : '.env';
require('dotenv').config({ path: envFile });

const app = new cdk.App();

new AppStack(app, 'AppStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
