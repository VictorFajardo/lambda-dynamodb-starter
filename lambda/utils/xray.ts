import AWSXRay, { Subsegment } from 'aws-xray-sdk-core';

AWSXRay.setContextMissingStrategy('IGNORE_ERROR');

export function withSubsegment<T>(
  name: string,
  fn: (subsegment?: Subsegment) => Promise<T>
): Promise<T> {
  const segment = AWSXRay.getSegment?.();
  const subsegment = segment ? segment.addNewSubsegment(name) : undefined;

  return fn(subsegment).finally(() => {
    if (subsegment) subsegment.close();
  });
}
