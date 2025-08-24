import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { Note } from '../types/types';import { docClient } from '../utils/dynamoClient';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');

    if (!body.content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Content is required' }),
      };
    }

    const note = {
      id: Date.now().toString(),
      content: body.content,
      createdAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: process.env.NOTES_TABLE,
        Item: note satisfies Note,
      })
    );

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Note created', note }),
    };
  } catch (error) {
    console.error('Create Note Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
