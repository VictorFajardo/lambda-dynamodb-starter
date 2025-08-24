import { APIGatewayProxyHandler } from 'aws-lambda';
import { ScanCommand } from '@aws-sdk/client-dynamodb';

import { docClient } from '../utils/dynamoClient';

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const result = await docClient.send(new ScanCommand({ TableName: process.env.NOTES_TABLE }));

    const notes = result.Items?.map((item) => ({
      id: item.id.S,
      content: item.content.S,
      createdAt: item.createdAt.S,
    })) || [];

    return {
      statusCode: 200,
      body: JSON.stringify({ notes }),
    };
  } catch (err) {
    console.error('Error fetching notes:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
