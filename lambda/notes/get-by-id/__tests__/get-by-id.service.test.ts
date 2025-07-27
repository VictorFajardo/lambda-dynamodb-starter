import { getNoteById } from '../get-by-id.service';
import { docClient } from '../../../utils/dynamoClient';

jest.mock('../../../utils/dynamoClient', () => ({
  docClient: { send: jest.fn() },
}));

describe('getNoteById service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return a note when found', async () => {
    const mockSend = docClient.send as jest.Mock;
    const note = {
      id: 'abc123',
      content: 'My note',
      createdAt: '2025-01-01T00:00:00Z',
    };

    mockSend.mockResolvedValueOnce({ Item: note });

    const result = await getNoteById('abc123');

    expect(result).toEqual(note);
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend.mock.calls[0][0].input.Key).toEqual({ id: 'abc123' });
  });

  it('should return undefined when note is not found', async () => {
    const mockSend = docClient.send as jest.Mock;
    mockSend.mockResolvedValueOnce({ Item: undefined });

    const result = await getNoteById('nonexistent');

    expect(result).toBeUndefined();
  });
});
