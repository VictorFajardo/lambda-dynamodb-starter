import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import * as path from 'path';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import 'dotenv/config';
import { createLambdaFunction } from './helpers/lambdaFunctionFactory';

export class AppStack extends Stack {
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

    // === Lambda: Create Note ===
    const createNoteAlias = createLambdaFunction({
      scope: this,
      id: 'CreateNoteFunction',
      entryPath: 'lambda/notes/create/handler.ts',
      table,
      resource: notesResource,
      httpMethod: 'POST',
      grantType: 'write',
      isProd,
    }
    );

    // === Lambda: Get All Notes ===
    createLambdaFunction({
      scope: this,
      id: 'GetAllNotesFunction',
      entryPath: 'lambda/notes/get-all/handler.ts',
      table,
      resource: notesResource,
      httpMethod: 'GET',
      grantType: 'read',
      isProd,
    }
    );

    // === Lambda: Get Note by ID ===
    createLambdaFunction({
      scope: this,
      id: 'GetNoteByIdFunction',
      entryPath: 'lambda/notes/get-by-id/handler.ts',
      table,
      resource: noteById,
      httpMethod: 'GET',
      grantType: 'read',
      isProd,
    }
    );

    // === Lambda: Put Note by ID ===
    createLambdaFunction({
      scope: this,
      id: 'UpdateNoteFunction',
      entryPath: 'lambda/notes/update/handler.ts',
      table,
      resource: noteById,
      httpMethod: 'PUT',
      grantType: 'readWrite',
      isProd,
    }
    );

    // === Lambda: Delete Note by ID ===
    createLambdaFunction({
      scope: this,
      id: 'DeleteNoteFunction',
      entryPath: 'lambda/notes/delete/handler.ts',
      table,
      resource: noteById,
      httpMethod: 'DELETE',
      grantType: 'readWrite',
      isProd,
    }
    );

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

    new CfnOutput(this, 'CreateNoteLambdaArn', {
      value: createNoteAlias.functionArn,
      description: 'ARN of the CreateNote Lambda function',
    });
  }
}
