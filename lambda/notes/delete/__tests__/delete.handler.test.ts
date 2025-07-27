import { handler } from '../delete.handler';
import * as service from '../delete.service';
import { APIGatewayProxyEvent } from 'aws-lambda';

jest.mock('../delete.service');

describe('deleteNote handler', () => {
    it('should return 200 on successful delete', async () => {
        jest.spyOn(service, 'deleteNote').mockResolvedValueOnce({ id: '123' });

        const event = {
            pathParameters: { id: '123' },
        } as unknown as APIGatewayProxyEvent;

        const response = await handler(event);

        expect(response.statusCode).toBe(200);
        expect(response.body).toContain('Note 123 deleted');
    });

    it('should return 400 if id missing', async () => {
        const event = {} as unknown as APIGatewayProxyEvent;
        const response = await handler(event);
        expect(response.statusCode).toBe(400);
    });
});