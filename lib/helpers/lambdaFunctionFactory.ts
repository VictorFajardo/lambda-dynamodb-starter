import * as path from 'path';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

type LambdaOrAlias = lambda.Function | lambda.Alias;

interface CreateLambdaFunctionProps {
  scope: Construct;
  id: string;
  entryPath: string;
  table: dynamodb.Table;
  resource: apigateway.IResource;
  httpMethod: string;
  grantType: 'read' | 'write' | 'readWrite';
  isProd: boolean;
  authorizer?: apigateway.CognitoUserPoolsAuthorizer;
}

export function createLambdaFunction({
  scope,
  id,
  entryPath,
  table,
  resource,
  httpMethod,
  grantType,
  isProd,
  authorizer,
}: CreateLambdaFunctionProps): LambdaOrAlias {
  const fn = new NodejsFunction(scope, id, {
    runtime: lambda.Runtime.NODEJS_20_X,
    entry: path.join(__dirname, '../../', entryPath),
    handler: 'handler',
    bundling: {
      minify: true,
      target: 'es2020',
      sourceMap: true,
      externalModules: ['aws-sdk'],
    },
    environment: {
      ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN ?? '*',
      TABLE_NAME: table.tableName,
      REGION: process.env.REGION ?? 'us-east-1',
    },
  });

  const lambdaResource = isProd
    ? new lambda.Alias(scope, `${id}ProdAlias`, {
        aliasName: 'prod',
        version: fn.currentVersion,
      })
    : fn;

  switch (grantType) {
    case 'read':
      table.grantReadData(lambdaResource);
      break;
    case 'write':
      table.grantWriteData(lambdaResource);
      break;
    case 'readWrite':
      table.grantReadWriteData(lambdaResource);
      break;
  }

  const methodId = `${id}${httpMethod}Method`;

  if (!resource.node.tryFindChild(methodId)) {
    resource
      .addMethod(httpMethod, new apigateway.LambdaIntegration(lambdaResource), {
        authorizer,
        authorizationType: authorizer
          ? apigateway.AuthorizationType.COGNITO
          : apigateway.AuthorizationType.NONE,
      })
      .node.addDependency(lambdaResource); // ensures deployment ordering
  }

  return lambdaResource;
}
