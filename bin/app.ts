import * as cdk from 'aws-cdk-lib';
import { AppStack } from '../lib/app-stack';

const app = new cdk.App();

const stack = new AppStack(app, 'AppStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});

cdk.Tags.of(stack).add('Project', 'Lambda-DynamoDB-Infra');
cdk.Tags.of(stack).add('Owner', 'VictorFajardo');
cdk.Tags.of(stack).add('Environment', process.env.ENV ?? 'dev');
cdk.Tags.of(stack).add('Repo', 'https://github.com/VictorFajardo/lambda-dynamodb-infra');

stack.templateOptions.description =
  'Serverless note-taking platform (Lambda + DynamoDB + API Gateway + Cognito)';
stack.addMetadata('GitHubRepo', 'VictorFajardo/lambda-dynamodb-infra');
stack.addMetadata('Owner', 'VictorFajardo');
stack.addMetadata('LastUpdated', new Date().toISOString());
