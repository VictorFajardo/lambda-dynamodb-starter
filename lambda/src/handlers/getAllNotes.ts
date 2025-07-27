import { APIGatewayProxyHandler } from 'aws-lambda';
import { ScanCommand } from '@aws-sdk/client-dynamodb';

import { docClient } from '../utils/dynamoClient';
import { internalError, ok } from '../utils/response';

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const command = new ScanCommand({ TableName: process.env.NOTES_TABLE });

    const result = await docClient.send(command);

    const notes =
      result.Items?.map((item) => ({
        id: item.id.S,
        content: item.content.S,
        createdAt: item.createdAt.S,
      })) || [];

    return ok({ notes });
  } catch (err) {
    return internalError();
  }
};
