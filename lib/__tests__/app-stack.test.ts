import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AppStack } from '../app-stack'; // adjust path as needed

describe('AppStack - Dev', () => {
  let app: App;
  let stack: AppStack;
  let template: Template;

  beforeEach(() => {
    app = new App({
      context: {
        STAGE: 'dev',
      },
    });
    stack = new AppStack(app, 'TestStack');
    template = Template.fromStack(stack);
  });

  it('matches snapshot', () => {
    expect(template.toJSON()).toMatchSnapshot();
  });

  it('creates a DynamoDB table with partition key "id"', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      KeySchema: [
        {
          AttributeName: 'id',
          KeyType: 'HASH',
        },
      ],
      AttributeDefinitions: [
        {
          AttributeName: 'id',
          AttributeType: 'S',
        },
      ],
    });
  });

  it('creates 5 Lambda functions', () => {
    template.resourceCountIs('AWS::Lambda::Function', 5);
  });

  it('creates API Gateway with expected methods on /notes and /notes/{id}', () => {
    const methods = template.findResources('AWS::ApiGateway::Method');

    // Filter out OPTIONS (CORS preflight)
    const nonOptionsMethods = Object.values(methods).filter(
      (m: any) => m.Properties.HttpMethod !== 'OPTIONS'
    );

    // We expect 5 CRUD methods
    expect(nonOptionsMethods.length).toBe(5);

    // Confirm the methods are exactly the ones you configured
    const expectedMethods = ['GET', 'GET', 'POST', 'PUT', 'DELETE'];
    const actualMethods = nonOptionsMethods.map((m: any) => m.Properties.HttpMethod);

    expect(actualMethods.sort()).toEqual(expectedMethods.sort());
  });

  it('exports API URL and DynamoDB table name as outputs', () => {
    template.hasOutput('ApiUrl', {});
    template.hasOutput('TableName', {});
  });
});

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

  it('matches snapshot', () => {
    expect(template.toJSON()).toMatchSnapshot();
  });

  it('uses prod-specific settings', () => {
    // Example: check if table has provisioned throughput in prod
    // (Adjust this based on actual prod config differences)
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      BillingMode: 'PROVISIONED',
    });
  });

  it('exports API URL and DynamoDB table name as outputs', () => {
    template.hasOutput('ApiUrl', {});
    template.hasOutput('TableName', {});
  });
});