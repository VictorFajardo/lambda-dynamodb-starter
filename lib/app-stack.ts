import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import * as path from 'path';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import 'dotenv/config';

type LambdaOrAlias = lambda.Function | lambda.Alias;

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

    // Create helper for Lambda Functions
    const createLambdaFunction = (
      scope: Construct,
      id: string,
      entryPath: string
    ): LambdaOrAlias => {
      const fn = new NodejsFunction(scope, id, {
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(__dirname, '..', entryPath),
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

      if (isProd) {
        const version = fn.currentVersion;
        return new lambda.Alias(scope, `${id}ProdAlias`, {
          aliasName: 'prod',
          version,
        });
      } else {
        return fn; // just return the function for dev
      }
    };

    // === Lambda: Create Note ===
    const createNoteAlias = createLambdaFunction(
      this,
      'CreateNoteFunction',
      'lambda/notes/create/handler.ts'
    );

    table.grantWriteData(createNoteAlias.lambda);
    notesResource.addMethod('POST', new apigateway.LambdaIntegration(createNoteAlias));

    // === Lambda: Get All Notes ===
    const getAllNotesAlias = createLambdaFunction(
      this,
      'GetAllNotesFunction',
      'lambda/notes/get-all/handler.ts'
    );

    table.grantReadData(getAllNotesAlias.lambda);
    notesResource.addMethod('GET', new apigateway.LambdaIntegration(getAllNotesAlias));

    // === Lambda: Get Note by ID ===
    const getNoteByIdAlias = createLambdaFunction(
      this,
      'GetNoteByIdFunction',
      'lambda/notes/get-by-id/handler.ts'
    );

    table.grantReadData(getNoteByIdAlias.lambda);
    noteById.addMethod('GET', new apigateway.LambdaIntegration(getNoteByIdAlias));

    // === Lambda: Put Note by ID ===
    const updateNoteAlias = createLambdaFunction(
      this,
      'UpdateNoteFunction',
      'lambda/notes/update/handler.ts'
    );

    table.grantReadWriteData(updateNoteAlias.lambda);
    noteById.addMethod('PUT', new apigateway.LambdaIntegration(updateNoteAlias));

    // === Lambda: Delete Note by ID ===
    const deleteNoteAlias = createLambdaFunction(
      this,
      'DeleteNoteFunction',
      'lambda/notes/delete/handler.ts'
    );

    table.grantReadWriteData(deleteNoteAlias.lambda);
    noteById.addMethod('DELETE', new apigateway.LambdaIntegration(deleteNoteAlias));

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
      value: createNoteAlias.lambda.functionArn,
      description: 'ARN of the CreateNote Lambda function',
    });
  }
}
