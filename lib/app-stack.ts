import { Stack, StackProps } from 'aws-cdk-lib';
import * as path from 'path';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import 'dotenv/config';

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

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

    // Create helper for Lambda Functions
    const createLambdaFunction = (scope: Construct, id: string, entryPath: string) => {
      return new NodejsFunction(scope, id, {
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(__dirname, '..', entryPath),
        handler: 'handler',
        environment: {
          ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN ?? '*',
          TABLE_NAME: table.tableName,
          REGION: process.env.REGION ?? 'us-east-1',
        },
      });
    };

    // === Lambda: Create Note ===
    const createNoteLambda = createLambdaFunction(
      this,
      'CreateNoteFunction',
      'lambda/notes/create/handler.ts'
    );

    table.grantWriteData(createNoteLambda);

    notesResource.addMethod('POST', new apigateway.LambdaIntegration(createNoteLambda));

    // === Lambda: Get All Notes ===
    const getAllNotesLambda = createLambdaFunction(
      this,
      'GetAllNotesFunction',
      'lambda/notes/get-all/handler.ts'
    );

    table.grantReadData(getAllNotesLambda);

    notesResource.addMethod('GET', new apigateway.LambdaIntegration(getAllNotesLambda));

    // === Lambda: Get Note by ID ===
    const getNoteByIdLambda = createLambdaFunction(
      this,
      'GetNoteByIdFunction',
      'lambda/notes/get-by-id/handler.ts'
    );

    table.grantReadData(getNoteByIdLambda);

    noteById.addMethod('GET', new apigateway.LambdaIntegration(getNoteByIdLambda));

    // === Lambda: Put Note by ID ===
    const updateNoteLambda = createLambdaFunction(
      this,
      'UpdateNoteFunction',
      'lambda/notes/update/handler.ts'
    );

    table.grantReadWriteData(updateNoteLambda);

    noteById.addMethod('PUT', new apigateway.LambdaIntegration(updateNoteLambda));

    // === Lambda: Delete Note by ID ===
    const deleteNoteLambda = createLambdaFunction(
      this,
      'DeleteNoteFunction',
      'lambda/notes/delete/handler.ts'
    );

    table.grantReadWriteData(deleteNoteLambda);

    noteById.addMethod('DELETE', new apigateway.LambdaIntegration(deleteNoteLambda));
  }
}
