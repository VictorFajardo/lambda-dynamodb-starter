/* eslint-disable @typescript-eslint/no-require-imports */
import * as cdk from 'aws-cdk-lib';
import { AppStack } from '../lib/app-stack';

const envFile = process.env.NODE_ENV === 'local' ? `.env.${process.env.NODE_ENV}` : '.env';
require('dotenv').config({ path: envFile });

const app = new cdk.App();

const stack = new AppStack(app, 'AppStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});

cdk.Tags.of(stack).add('Project', 'Lambda-DynamoDB-Infra');
cdk.Tags.of(stack).add('Owner', 'Victor Fajardo');
cdk.Tags.of(stack).add('Environment', process.env.ENV ?? 'dev');
cdk.Tags.of(stack).add('Repo', 'https://github.com/VictorFajardo/lambda-dynamodb-infra');
cdk.Tags.of(stack).add('LastUpdated', new Date().toISOString());

stack.templateOptions.description =
  'Serverless note-taking platform (Lambda + DynamoDB + API Gateway + Cognito)';
stack.addMetadata('GitHubRepo', 'VictorFajardo/lambda-dynamodb-infra');
stack.addMetadata('Owner', 'Victor Fajardo');
stack.addMetadata('LastUpdated', new Date().toISOString());
