import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const dynamo = new DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body || '{}');
  const note = {
    id: Date.now().toString(),
    content: body.content,
    createdAt: new Date().toISOString()
  };

  await dynamo.put({
    TableName: process.env.NOTES_TABLE as string,
    Item: note
  }).promise();

  return {
    statusCode: 201,
    body: JSON.stringify({ message: 'Note created', note })
  };
};