import { deleteNote } from '../service';
import { docClient } from '../../../utils/dynamoClient';

jest.mock('../../../utils/dynamoClient', () => ({
  docClient: {
    send: jest.fn(),
  },
}));

describe('deleteNote service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should delete a note with correct id', async () => {
    const mockSend = docClient.send as jest.Mock;
    mockSend.mockResolvedValueOnce({});

    const id = '123456789';
    const result = await deleteNote(id);

    expect(result).toEqual({ id });

    expect(mockSend).toHaveBeenCalledTimes(1);
    const sentCommand = mockSend.mock.calls[0][0];

    // Check TableName and Key
    expect(sentCommand.input.TableName).toBe(process.env.NOTES_TABLE);
    expect(sentCommand.input.Key).toEqual({ id });

    // Check ConditionExpression presence
    expect(sentCommand.input.ConditionExpression).toBe('attribute_exists(id)');
  });

  it('should throw error if note does not exist', async () => {
    const mockSend = docClient.send as jest.Mock;
    const error = new Error('ConditionalCheckFailedException');
    mockSend.mockRejectedValueOnce(error);

    await expect(deleteNote('non-existent-id')).rejects.toThrow('ConditionalCheckFailedException');
  });
});
