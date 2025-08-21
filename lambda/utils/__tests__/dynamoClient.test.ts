import * as dynamoClient from '../dynamoClient';

describe('dynamoClient', () => {
  it('should export a docClient instance', () => {
    expect(dynamoClient.docClient).toBeDefined();
    expect(typeof dynamoClient.docClient.send).toBe('function');
  });
});
