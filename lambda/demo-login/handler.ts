import {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient({ region: process.env.REGION });

export async function handler() {
  try {
    const resp = await client.send(
      new AdminInitiateAuthCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID!,
        ClientId: process.env.COGNITO_CLIENT_ID!,
        AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: process.env.COGNITO_DEMO_USER!,
          PASSWORD: process.env.COGNITO_DEMO_PASSWORD!,
        },
      })
    );

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN ?? '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      },
      body: JSON.stringify(resp.AuthenticationResult),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(err) }),
    };
  }
}
