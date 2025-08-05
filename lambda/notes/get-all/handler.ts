import { APIGatewayProxyHandler } from 'aws-lambda';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../../utils/dynamoClient';

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('🔍 GET /notes event:', JSON.stringify(event));

  try {
    const result = await docClient.send(
      new ScanCommand({ TableName: process.env.TABLE_NAME })
    );

    console.log('✅ Scan result:', result.Items);

    return {
      statusCode: 200,
      body: JSON.stringify({ notes: result.Items || [] }),
    };
  } catch (error) {
    console.error('❌ Error scanning table:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
