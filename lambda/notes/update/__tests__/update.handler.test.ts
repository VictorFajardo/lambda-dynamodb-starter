import { handler } from '../update.handler';
import * as service from '../update.service';

jest.mock('../update.service');

describe('updateNote handler', () => {
    it('should return 200 on successful update', async () => {
        const updatedNote = { id: '1', content: 'updated', createdAt: 'now' };
        jest.spyOn(service, 'updateNote').mockResolvedValueOnce(updatedNote);

        const event = {
            pathParameters: { id: '1' },
            body: JSON.stringify({ content: 'updated' }),
        } as any;

        const response = await handler(event);
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual({ message: 'Note updated', note: updatedNote });
    });

    it('should return 400 if id missing', async () => {
        const event = { body: JSON.stringify({ content: 'updated' }) } as any;
        const response = await handler(event);
        expect(response.statusCode).toBe(400);
    });
});