import { handler } from '../get-by-id.handler';
import * as service from '../get-by-id.service';

jest.mock('../get-by-id.service');

describe('getNoteById handler', () => {
    it('should return 200 with note if found', async () => {
        const mockNote = { id: '1', content: 'test', createdAt: 'now' };
        jest.spyOn(service, 'getNoteById').mockResolvedValueOnce(mockNote);

        const event = { pathParameters: { id: '1' } } as any;
        const response = await handler(event);

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual({ note: mockNote });
    });

    it('should return 404 if not found', async () => {
        jest.spyOn(service, 'getNoteById').mockResolvedValueOnce(undefined);

        const event = { pathParameters: { id: '999' } } as any;
        const response = await handler(event);

        expect(response.statusCode).toBe(404);
    });
});