import { mockClient } from 'aws-sdk-client-mock';
import {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  AdminInitiateAuthCommandInput,
  AdminInitiateAuthCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { handler } from '../handler'; // adjust path to your Lambda

// Mock the Cognito client
const cognitoMock = mockClient(CognitoIdentityProviderClient);

describe('demo-login Lambda', () => {
  const ENV = {
    COGNITO_USER_POOL_ID: 'us-east-1_testPool',
    COGNITO_CLIENT_ID: 'testClientId',
    COGNITO_DEMO_USER: 'testuser@example.com',
    COGNITO_DEMO_PASSWORD: 'super-secret',
    REGION: 'us-east-1',
  };

  beforeEach(() => {
    process.env = { ...process.env, ...ENV };
    cognitoMock.reset();
  });

  it('should return tokens on successful login', async () => {
    const fakeTokens: AdminInitiateAuthCommandOutput = {
      AuthenticationResult: {
        IdToken: 'id-token',
        AccessToken: 'access-token',
        RefreshToken: 'refresh-token',
        ExpiresIn: 3600,
        TokenType: 'Bearer',
      },
      $metadata: {
        httpStatusCode: 200,
        requestId: '',
        extendedRequestId: undefined,
        cfId: undefined,
        attempts: 1,
        totalRetryDelay: 0,
      },
    };

    cognitoMock.on(AdminInitiateAuthCommand).resolves(fakeTokens);

    const result = await handler();

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.IdToken).toBe('id-token');
    expect(body.AccessToken).toBe('access-token');

    // Type-safe check of command input
    const callArgs = cognitoMock.calls()[0].args[0].input as AdminInitiateAuthCommandInput;
    expect(callArgs.AuthFlow).toBe('ADMIN_USER_PASSWORD_AUTH');
    expect(callArgs.AuthParameters?.USERNAME).toBe(ENV.COGNITO_DEMO_USER);
    expect(callArgs.AuthParameters?.PASSWORD).toBe(ENV.COGNITO_DEMO_PASSWORD);
  });

  it('should handle Cognito errors gracefully', async () => {
    cognitoMock.on(AdminInitiateAuthCommand).rejects(new Error('User not found'));

    const result = await handler();
    expect(result.statusCode).toBe(500);
    const body = JSON.parse(result.body);
    expect(body.error).toContain('User not found');
  });

  it('should fail if environment variables are missing', async () => {
    delete process.env.COGNITO_DEMO_PASSWORD; // simulate missing env

    const result = await handler();
    expect(result.statusCode).toBe(500);
    const body = JSON.parse(result.body);
    expect(body.error).toContain('undefined'); // the missing variable triggers error
  });
});
