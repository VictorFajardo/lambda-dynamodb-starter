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

  it('creates API Gateway with /notes resource and methods', () => {
    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Name: 'Notes Service',
    });

    template.resourceCountIs('AWS::ApiGateway::Method', 5); // POST, GET, GET /{id}, PUT, DELETE
  });
});
