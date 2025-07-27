import { getAllNotes } from '../service';
import { docClient } from '../../../utils/dynamoClient';

jest.mock('../../../utils/dynamoClient', () => ({
  docClient: { send: jest.fn() },
}));

describe('getAllNotes service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return parsed notes from DynamoDB', async () => {
    const mockSend = docClient.send as jest.Mock;

    const mockItems = [
      {
        id: { S: '1' },
        content: { S: 'Note 1' },
        createdAt: { S: '2025-07-25T00:00:00Z' },
      },
      {
        id: { S: '2' },
        content: { S: 'Note 2' },
        createdAt: { S: '2025-07-26T00:00:00Z' },
      },
    ];

    mockSend.mockResolvedValueOnce({ Items: mockItems });

    const result = await getAllNotes();

    expect(result).toEqual([
      {
        id: '1',
        content: 'Note 1',
        createdAt: '2025-07-25T00:00:00Z',
      },
      {
        id: '2',
        content: 'Note 2',
        createdAt: '2025-07-26T00:00:00Z',
      },
    ]);

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend.mock.calls[0][0].input.TableName).toBe(process.env.NOTES_TABLE);
  });

  it('should return empty array if no Items', async () => {
    const mockSend = docClient.send as jest.Mock;
    mockSend.mockResolvedValueOnce({ Items: undefined });

    const result = await getAllNotes();

    expect(result).toEqual([]);
  });
});
