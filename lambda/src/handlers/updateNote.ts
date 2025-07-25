import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { docClient } from '../utils/dynamoClient';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const noteId = event.pathParameters?.id;
    const body = JSON.parse(event.body || '{}');

    if (!noteId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Note ID is required' }),
      };
    }

    if (!body.content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Content is required' }),
      };
    }

    const command = new UpdateCommand({
      TableName: process.env.NOTES_TABLE,
      Key: { id: noteId },
      UpdateExpression: 'set content = :content',
      ExpressionAttributeValues: {
        ':content': body.content,
      },
      ConditionExpression: 'attribute_exists(id)',
      ReturnValues: 'ALL_NEW',
    });

    const result = await docClient.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Note updated', note: result.Attributes }),
    };
  } catch (error: any) {
    if (error.name === 'ConditionalCheckFailedException') {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Note not found' }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error', error }),
    };
  }
};
