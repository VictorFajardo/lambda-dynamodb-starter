import { Stack, StackProps } from 'aws-cdk-lib';
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
    const notesResource = api.root.getResource('notes') || api.root.addResource('notes');
    const noteById = notesResource.addResource('{id}');

    // Create enviroment for Lambda Functions
    const environment = {
      ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || '*',
      TABLE_NAME: table.tableName,
      REGION: process.env.REGION || 'us-east-1',
    };

    // === Lambda: Create Note ===
    const createNoteLambda = new NodejsFunction(this, 'CreateNoteFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: 'lambda/notes/create/handler.ts',
      handler: 'handler',
      environment: environment
    });

    table.grantWriteData(createNoteLambda);

    notesResource.addMethod('POST', new apigateway.LambdaIntegration(createNoteLambda));

    // === Lambda: Get All Notes ===
    const getAllNotesLambda = new NodejsFunction(this, 'GetAllNotesFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: 'lambda/notes/get-all/handler.ts',
      handler: 'handler',
      environment: environment
    });

    table.grantReadData(getAllNotesLambda);

    notesResource.addMethod('GET', new apigateway.LambdaIntegration(getAllNotesLambda));

    // === Lambda: Get Note by ID ===
    const getNoteByIdLambda = new NodejsFunction(this, 'GetNoteByIdFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: 'lambda/notes/get-by-id/handler.ts',
      handler: 'handler',
      environment: environment
    });

    table.grantReadData(getNoteByIdLambda);

    noteById.addMethod('GET', new apigateway.LambdaIntegration(getNoteByIdLambda));

    // === Lambda: Put Note by ID ===
    const updateNoteLambda = new NodejsFunction(this, 'UpdateNoteFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: 'lambda/notes/update/handler.ts',
      handler: 'handler',
      environment: environment
    });

    table.grantReadWriteData(updateNoteLambda);

    noteById.addMethod('PUT', new apigateway.LambdaIntegration(updateNoteLambda));

    // === Lambda: Delete Note by ID ===
    const deleteNoteLambda = new NodejsFunction(this, 'DeleteNoteFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: 'lambda/notes/delete/handler.ts',
      handler: 'handler',
      environment: environment
    });

    table.grantReadWriteData(deleteNoteLambda);

    noteById.addMethod('DELETE', new apigateway.LambdaIntegration(deleteNoteLambda));
  }
}
