import { updateNote } from '../update.service';
import { docClient } from '../../../utils/dynamoClient';

jest.mock('../../../utils/dynamoClient', () => ({
  docClient: { send: jest.fn() },
}));

describe('updateNote service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should update a note with the given content', async () => {
    const mockSend = docClient.send as jest.Mock;
    const mockUpdated = {
      id: '123',
      content: 'Updated content',
      createdAt: '2025-01-01T00:00:00Z',
    };

    mockSend.mockResolvedValueOnce({ Attributes: mockUpdated });

    const result = await updateNote('123', 'Updated content');

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockUpdated);
  });

  it('should throw error if note does not exist', async () => {
    const mockSend = docClient.send as jest.Mock;
    const error = new Error('ConditionalCheckFailedException');
    error.name = 'ConditionalCheckFailedException';
    mockSend.mockRejectedValueOnce(error);

    await expect(updateNote('fake-id', 'some content')).rejects.toThrow(
      'ConditionalCheckFailedException'
    );
  });
});
