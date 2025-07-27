import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../create.handler';
import * as service from '../create.service';

jest.mock('../create.service');

describe('createNote handler', () => {
    it('should return 201 with note data', async () => {
        const mockNote = {
            id: '123',
            content: 'test',
            createdAt: '2025-07-27T00:00:00Z',
        };

        jest.spyOn(service, 'createNote').mockResolvedValueOnce(mockNote);

        const event = {
            body: JSON.stringify({ content: 'test' }),
        } as unknown as APIGatewayProxyEvent;

        const response = await handler(event);

        expect(response.statusCode).toBe(201);
        expect(JSON.parse(response.body).note).toEqual(mockNote);
    });

    it('should return 400 on validation error', async () => {
        [JSON.stringify({}), undefined].map(async (body) => {
            const event = {
                body
            } as unknown as APIGatewayProxyEvent;

            const response = await handler(event);

            expect(response.statusCode).toBe(400);
        })
    });

    it('returns 500 when body is invalid JSON', async () => {
        const event = {
            body: '{"invalidJson": true,', // malformed JSON
        } as unknown as APIGatewayProxyEvent;

        const result = await handler(event);

        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body)).toEqual({
            message: 'Internal Server Error',
        });
    });
});
