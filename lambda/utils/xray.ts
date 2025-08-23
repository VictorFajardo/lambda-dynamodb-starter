import * as AWSXRay from 'aws-xray-sdk-core';
import { Subsegment } from 'aws-xray-sdk-core';

AWSXRay.setContextMissingStrategy('IGNORE_ERROR');

export async function withSubsegment<T>(
  name: string,
  fn: (subsegment?: Subsegment) => Promise<T>
): Promise<T> {
  const segment = AWSXRay.getSegment?.();
  const subsegment = segment ? segment.addNewSubsegment(name) : undefined;

  try {
    return await fn(subsegment);
  } finally {
    subsegment?.close();
  }
}
