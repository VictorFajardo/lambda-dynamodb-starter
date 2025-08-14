import * as fs from 'fs';
import * as cdk from 'aws-cdk-lib';
import { AppStack } from '../lib/app-stack';

const app = new cdk.App();
const stack = new AppStack(app, 'AppStack');

const envVars: Record<string, { TABLE_NAME: string; DYNAMO_ENDPOINT: string }> = {};

stack.functions.forEach((fn) => {
  // Use the node.id of the Lambda (CDK appends a unique suffix)
  envVars[fn.id] = {
    TABLE_NAME: fn.env.TABLE_NAME,
    DYNAMO_ENDPOINT: fn.env.DYNAMO_ENDPOINT,
  };
});

fs.writeFileSync('env.local.json', JSON.stringify(envVars, null, 2));
console.log('✅ env.local.json generated successfully!');
