import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as path from "path";

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, "NotesTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const createNoteLambda = new lambda.Function(this, "CreateNoteHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "createNote.handler",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../../lambda/handlers")
      ),
      environment: {
        NOTES_TABLE: table.tableName,
      },
    });

    table.grantWriteData(createNoteLambda);

    const api = new apigateway.RestApi(this, "NotesApi", {
      restApiName: "Notes Service",
    });

    const notes = api.root.addResource("notes");
    notes.addMethod("POST", new apigateway.LambdaIntegration(createNoteLambda));
  }
}
