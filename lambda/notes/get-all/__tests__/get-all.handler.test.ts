import { handler } from '../get-all.handler';
import * as service from '../get-all.service';

describe('getAllNotes handler', () => {
    it('should return 200 with notes', async () => {
        const mockNotes = [{ id: '1', content: 'test', createdAt: 'now' }];
        jest.spyOn(service, 'getAllNotes').mockResolvedValueOnce(mockNotes);

        const response = await handler();
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual({ notes: mockNotes });
    });
});