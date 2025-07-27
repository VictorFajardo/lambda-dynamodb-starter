import { docClient } from '../dynamoClient';

describe('DynamoDB Document Client', () => {
    it('should initialize the docClient', () => {
        expect(docClient).toBeDefined();
        expect(typeof docClient.send).toBe('function');
    });
});
