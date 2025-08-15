jest.mock('aws-xray-sdk-core', () => ({
  getSegment: jest.fn(() => ({
    addNewSubsegment: jest.fn(() => ({
      addAnnotation: jest.fn(),
      addMetadata: jest.fn(),
      close: jest.fn(),
    })),
  })),
  captureAWSv3Client: jest.fn((client) => client),
}));
