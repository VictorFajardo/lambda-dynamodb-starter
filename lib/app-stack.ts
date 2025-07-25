import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table
    const table = new dynamodb.Table(this, 'NotesTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For dev/testing only
    });

    // Lambda function for creating notes
    const createNoteLambda = new NodejsFunction(this, 'CreateNoteFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '..', 'lambda', 'notes', 'createNote.ts'),
      handler: 'handler',
      environment: {
        NOTES_TABLE: table.tableName,
      },
    });

    // Grant Lambda write permissions to the table
    table.grantWriteData(createNoteLambda);

    // API Gateway REST API
    const api = new apigateway.RestApi(this, 'NotesApi', {
      restApiName: 'Notes Service',
    });

    // Create /notes resource with POST method integrated to Lambda
    const notes = api.root.addResource('notes');
    notes.addMethod('POST', new apigateway.LambdaIntegration(createNoteLambda));
  }
}
