import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { AppStack } from '../app-stack';

describe('AppStack', () => {
  const app = new App();
  const stack = new AppStack(app, 'TestStack');
  const template = Template.fromStack(stack);

  it('creates a DynamoDB table with id partition key', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    });
  });

  it('creates 5 Lambda functions', () => {
    template.resourceCountIs('AWS::Lambda::Function', 5);
  });

  it('sets environment variable for all Lambdas', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Environment: {
        Variables: Match.objectLike({
          TABLE_NAME: Match.anyValue(),
        }),
      },
    });
  });

  it('creates API Gateway with /notes resource and CRUD methods', () => {
    const methods = template.findResources('AWS::ApiGateway::Method');

    // Filter out the OPTIONS methods that CDK creates for CORS
    const nonOptionsMethods = Object.values(methods).filter(
      (m: any) => m.Properties.HttpMethod !== 'OPTIONS'
    );

    // We expect only the CRUD methods: POST, GET (all), GET (by id), PUT, DELETE
    expect(nonOptionsMethods.length).toBe(5);

    // Optional: ensure they are exactly the ones we expect
    const expected = ['POST', 'GET', 'GET', 'PUT', 'DELETE'];
    const actual = nonOptionsMethods.map((m: any) => m.Properties.HttpMethod);
    expect(actual.sort()).toEqual(expected.sort());
  });
});
