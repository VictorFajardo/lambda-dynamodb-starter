/* eslint-disable @typescript-eslint/no-explicit-any */
import * as AWSXRay from 'aws-xray-sdk-core';
import { withSubsegment } from '../xray';

describe('withSubsegment', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call fn with a subsegment when a segment exists', async () => {
    const closeMock = jest.fn();
    const addNewSubsegmentMock = jest.fn().mockReturnValue({ close: closeMock });

    jest.spyOn(AWSXRay, 'getSegment').mockReturnValue({
      addNewSubsegment: addNewSubsegmentMock,
    } as any);

    const fn = jest.fn().mockResolvedValue('result');

    const result = await withSubsegment('test-sub', fn);

    expect(addNewSubsegmentMock).toHaveBeenCalledWith('test-sub');
    expect(fn).toHaveBeenCalledWith({ close: closeMock });
    expect(closeMock).toHaveBeenCalled();
    expect(result).toBe('result');
  });

  it('should call fn without a subsegment when no segment exists', async () => {
    jest.spyOn(AWSXRay, 'getSegment').mockReturnValue(undefined);

    const fn = jest.fn().mockResolvedValue('no-segment-result');

    const result = await withSubsegment('test-sub', fn);

    expect(fn).toHaveBeenCalledWith(undefined);
    expect(result).toBe('no-segment-result');
  });

  it('should close subsegment even if fn throws', async () => {
    const closeMock = jest.fn();
    const addNewSubsegmentMock = jest.fn().mockReturnValue({ close: closeMock });

    jest.spyOn(AWSXRay, 'getSegment').mockReturnValue({
      addNewSubsegment: addNewSubsegmentMock,
    } as any);

    const fn = jest.fn().mockRejectedValue(new Error('boom'));

    await expect(withSubsegment('test-sub', fn)).rejects.toThrow('boom');

    expect(closeMock).toHaveBeenCalled();
  });
});
