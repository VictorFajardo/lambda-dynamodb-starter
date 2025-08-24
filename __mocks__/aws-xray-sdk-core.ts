export default {
  getSegment: jest.fn(() => ({
    addNewSubsegment: jest.fn(() => ({
      addAnnotation: jest.fn(),
      addMetadata: jest.fn(),
      close: jest.fn(),
    })),
  })),
};
