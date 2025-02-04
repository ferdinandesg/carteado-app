export default {
  room: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    updateMany: jest.fn(),
  },
  player: {
    findMany: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
  },
};
