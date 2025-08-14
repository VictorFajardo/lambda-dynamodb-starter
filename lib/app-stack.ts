import { createLambdaFunction } from './helpers/lambdaFunctionFactory';
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

interface LambdaEnv {
  id: string;
  env: Record<string, string>;
}

export class AppStack extends Stack {
  public readonly functions: LambdaEnv[] = [];

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const isProd = process.env.STAGE === 'prod';

    // DynamoDB Table
    const table = new dynamodb.Table(this, 'NotesTable', {
      tableName: 'NotesTable',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      // billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'NotesApi', {
      restApiName: 'Notes Service',
    });

    // Create /notes and /notes/{id} resources once and store it
    const notesResource = api.root.addResource('notes');
    const noteById = notesResource.addResource('{id}');

    // Add CORS
    notesResource.addCorsPreflight({
      allowOrigins: [process.env.ALLOWED_ORIGIN ?? '*'],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    });
    noteById.addCorsPreflight({
      allowOrigins: [process.env.ALLOWED_ORIGIN ?? '*'],
      allowMethods: ['GET', 'PUT', 'DELETE'],
    });

    const addLambda = (props: Parameters<typeof createLambdaFunction>[0]) => {
      const lambdaFn = createLambdaFunction(props);

      // Track env separately for SAM local
      this.functions.push({
        id: lambdaFn.node.id,
        env: {
          TABLE_NAME: 'NotesTable',
          DYNAMO_ENDPOINT: process.env.DYNAMO_ENDPOINT ?? 'http://host.docker.internal:8000',
        },
      });

      return lambdaFn;
    };

    // === Lambda: Create Note ===
    addLambda({
      scope: this,
      id: 'CreateNoteFunction',
      entryPath: 'lambda/notes/create/handler.ts',
      table,
      resource: notesResource,
      httpMethod: 'POST',
      grantType: 'write',
      isProd,
    });

    // === Lambda: Get All Notes ===
    addLambda({
      scope: this,
      id: 'GetAllNotesFunction',
      entryPath: 'lambda/notes/get-all/handler.ts',
      table,
      resource: notesResource,
      httpMethod: 'GET',
      grantType: 'read',
      isProd,
    });

    // === Lambda: Get Note by ID ===
    addLambda({
      scope: this,
      id: 'GetNoteByIdFunction',
      entryPath: 'lambda/notes/get-by-id/handler.ts',
      table,
      resource: noteById,
      httpMethod: 'GET',
      grantType: 'read',
      isProd,
    });

    // === Lambda: Put Note by ID ===
    addLambda({
      scope: this,
      id: 'UpdateNoteFunction',
      entryPath: 'lambda/notes/update/handler.ts',
      table,
      resource: noteById,
      httpMethod: 'PUT',
      grantType: 'readWrite',
      isProd,
    });

    // === Lambda: Delete Note by ID ===
    addLambda({
      scope: this,
      id: 'DeleteNoteFunction',
      entryPath: 'lambda/notes/delete/handler.ts',
      table,
      resource: noteById,
      httpMethod: 'DELETE',
      grantType: 'readWrite',
      isProd,
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

    // new CfnOutput(this, 'CreateNoteLambdaArn', {
    //   value: createNoteAlias.functionArn,
    //   description: 'ARN of the CreateNote Lambda function',
    // });
  }
}
