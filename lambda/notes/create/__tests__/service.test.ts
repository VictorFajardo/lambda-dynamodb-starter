import { createNote } from '../service';
import { docClient } from '../../../utils/dynamoClient';

jest.mock('../../../utils/dynamoClient', () => ({
  docClient: {
    send: jest.fn(),
  },
}));

describe('createNote service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create and return a valid note object', async () => {
    const mockSend = docClient.send as jest.Mock;
    mockSend.mockResolvedValueOnce({});

    const input = { content: 'Test note content' };
    const result = await createNote(input);

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('createdAt');
    expect(result.content).toBe(input.content);
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend.mock.calls[0][0].input.Item.content).toBe(input.content);
  });
});
