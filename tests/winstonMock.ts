export const infoMock = jest.fn();
export const errorMock = jest.fn();
export const warnMock = jest.fn();

export const resetMocks = () => {
  infoMock.mockReset();
  errorMock.mockReset();
  warnMock.mockReset();
};

export const format = {
  combine: jest.fn((...args: any[]) => args),
  timestamp: jest.fn(() => 'timestamp'),
  json: jest.fn(() => 'json'),
};

export const transports = {
  Console: jest.fn(),
};

const winstonMock = {
  createLogger: jest.fn(() => ({
    info: infoMock,
    error: errorMock,
    warn: warnMock,
  })),
  format,
  transports,
};

export default winstonMock;
