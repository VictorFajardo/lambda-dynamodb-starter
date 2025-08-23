import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import { createLambdaFunction } from './helpers/lambdaFunctionFactory';

interface LambdaEnv {
  id: string;
  env: Record<string, string>;
}

export class AppStack extends Stack {
  public readonly functions: LambdaEnv[] = [];

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const isProd = process.env.STAGE === 'prod';

    // === DynamoDB ===
    const table = new dynamodb.Table(this, 'NotesTable', {
      tableName: 'NotesTable',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      // billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // === API Gateway ===
    const api = new apigateway.RestApi(this, 'NotesApi', {
      restApiName: 'Notes Service',
    });

    // API Resources
    const notesResource = api.root.addResource('notes');
    const noteById = notesResource.addResource('{id}');

    // === Cognito ===
    const userPool = new cognito.UserPool(this, 'NotesUserPool', {
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'NotesUserPoolClient', {
      userPool,
      authFlows: { userPassword: true },
      preventUserExistenceErrors: true,
      generateSecret: false,
    });

    const accountSuffix = this.account
      .slice(-6)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');

    const domain = userPool.addDomain('NotesUserPoolDomain', {
      cognitoDomain: { domainPrefix: `notes-demo-${accountSuffix}` },
    });

    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'NotesAuthorizer', {
      cognitoUserPools: [userPool],
    });

    // === Helper to create Lambdas ===
    const addLambda = (props: Parameters<typeof createLambdaFunction>[0]) => {
      const lambdaFn = createLambdaFunction(props);

      // Track env separately for SAM/local
      this.functions.push({
        id: lambdaFn.node.id,
        env: {
          TABLE_NAME: 'NotesTable',
          DYNAMO_ENDPOINT: process.env.DYNAMO_ENDPOINT ?? 'http://host.docker.internal:8000',
        },
      });

      return lambdaFn;
    };

    // === Lambda Definitions ===
    addLambda({
      scope: this,
      id: 'CreateNoteFunction',
      entryPath: 'lambda/notes/create/handler.ts',
      table,
      resource: notesResource,
      httpMethod: 'POST',
      grantType: 'write',
      isProd,
      authorizer,
    });

    addLambda({
      scope: this,
      id: 'GetAllNotesFunction',
      entryPath: 'lambda/notes/get-all/handler.ts',
      table,
      resource: notesResource,
      httpMethod: 'GET',
      grantType: 'read',
      isProd,
      authorizer,
    });

    addLambda({
      scope: this,
      id: 'GetNoteByIdFunction',
      entryPath: 'lambda/notes/get-by-id/handler.ts',
      table,
      resource: noteById,
      httpMethod: 'GET',
      grantType: 'read',
      isProd,
      authorizer,
    });

    addLambda({
      scope: this,
      id: 'UpdateNoteFunction',
      entryPath: 'lambda/notes/update/handler.ts',
      table,
      resource: noteById,
      httpMethod: 'PUT',
      grantType: 'readWrite',
      isProd,
      authorizer,
    });

    addLambda({
      scope: this,
      id: 'DeleteNoteFunction',
      entryPath: 'lambda/notes/delete/handler.ts',
      table,
      resource: noteById,
      httpMethod: 'DELETE',
      grantType: 'readWrite',
      isProd,
      authorizer,
    });

    const demoLoginFn = addLambda({
      scope: this,
      id: 'DemoLoginFunction',
      entryPath: 'lambda/demo-login/handler.ts',
      table,
      resource: api.root.addResource('demo-login'),
      httpMethod: 'POST',
      grantType: 'readWrite',
      isProd,
      authorizer: undefined,
      environment: {
        COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID!,
        COGNITO_DOMAIN: process.env.COGNITO_DOMAIN!,
        COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID!,
        COGNITO_DEMO_USER: process.env.COGNITO_DEMO_USER!,
        COGNITO_DEMO_PASSWORD: process.env.COGNITO_DEMO_PASSWORD!,
      },
    });

    // Grant Cognito auth permissions
    demoLoginFn.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['cognito-idp:AdminInitiateAuth'],
        resources: [userPool.userPoolArn],
      })
    );

    // === CORS ===
    const allowedOrigin = process.env.ALLOWED_ORIGIN ?? '*';

    notesResource.addCorsPreflight({
      allowOrigins: [allowedOrigin],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowHeaders: ['Content-Type', 'Authorization'],
      allowCredentials: true,
    });

    noteById.addCorsPreflight({
      allowOrigins: [allowedOrigin],
      allowMethods: ['GET', 'PUT', 'DELETE'],
      allowHeaders: ['Content-Type', 'Authorization'],
      allowCredentials: true,
    });

    // === Outputs ===
    new CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'Base URL for the Notes API',
      exportName: 'NotesApiUrl',
    });

    new CfnOutput(this, 'TableName', {
      value: table.tableName,
      description: 'Name of the DynamoDB table',
      exportName: 'NotesTableName',
    });

    new CfnOutput(this, 'CognitoDomain', {
      value: `https://${domain.domainName}.auth.${this.region}.amazoncognito.com`,
    });

    new CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
    });

    new CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
    });
  }
}
