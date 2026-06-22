// jest.config.cjs — CommonJS explícito para evitar conflito com "type": "module"
// Utiliza ts-jest ESM preset para executar .ts em modo ESM com Node.js 20+

/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["<rootDir>/src/__tests__/**/*.test.ts"],
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          types: ["node", "jest"],
          strict: true,
          esModuleInterop: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    // Bloqueia o shim legado @prisma/client para não carregar o runtime v6
    "^@prisma/client(.*)$": "<rootDir>/src/__tests__/__mocks__/prisma.ts",
    // Prisma singleton → mock (com ou sem .js)
    "^(\\.\\./)+lib/prisma(\\.js)?$": "<rootDir>/src/__tests__/__mocks__/prisma.ts",
    // Prisma 7 gerado → mock
    "^(\\.\\./)+generated/prisma/client(\\.js)?$": "<rootDir>/src/__tests__/__mocks__/prisma.ts",
    // Stripping de .js para todos os outros imports relativos (ts-jest ESM padrão)
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  roots: ["<rootDir>"],
  clearMocks: true,
  resetMocks: false,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/__tests__/**",
    "!src/index.ts",
    "!src/**/@types/**",
    "!src/generated/**",
  ],
};
