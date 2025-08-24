/* eslint-disable @typescript-eslint/no-explicit-any */
import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AppStack } from '../app-stack';

describe('AppStack - Prod', () => {
  let app: App;
  let stack: AppStack;
  let template: Template;

  beforeEach(() => {
    app = new App({
      context: {
        STAGE: 'prod',
      },
    });
    stack = new AppStack(app, 'TestStackProd');
    template = Template.fromStack(stack);
  });

  it('creates a DynamoDB table with partition key "id"', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    });
  });

  it('creates Lambda functions', () => {
    template.resourceCountIs('AWS::Lambda::Function', 6);
  });

  it('creates API Gateway with expected methods', () => {
    const methods = template.findResources('AWS::ApiGateway::Method');

    const nonOptionsMethods = Object.values(methods).filter(
      (m: any) => m.Properties.HttpMethod !== 'OPTIONS'
    );

    expect(nonOptionsMethods.length).toBe(6);

    const expectedMethods = ['GET', 'GET', 'POST', 'POST', 'PUT', 'DELETE'];
    const actualMethods = nonOptionsMethods.map((m: any) => m.Properties.HttpMethod);

    expect(actualMethods.sort()).toEqual(expectedMethods.sort());
  });

  it('exports API URL and DynamoDB table name as outputs', () => {
    template.hasOutput('ApiUrl', {});
    template.hasOutput('TableName', {});
  });
});
