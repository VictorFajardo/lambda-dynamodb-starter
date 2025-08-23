jest.mock('aws-xray-sdk-core', () => {
  return {
    setContextMissingStrategy: jest.fn(),
    captureAWSv3Client: jest.fn((client) => client), // just return raw client in tests

    getSegment: jest.fn(() => ({
      addNewSubsegment: jest.fn(() => ({
        addAnnotation: jest.fn(),
        addMetadata: jest.fn(),
        close: jest.fn(),
      })),
    })),
  };
});
