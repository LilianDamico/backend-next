import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "src",
  testMatch: ["**/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          types: ["node", "jest"],
          strict: true,
          esModuleInterop: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    "^(?:\\.\\./)+lib/prisma$": "<rootDir>/__tests__/__mocks__/prisma.ts",
  },
  clearMocks: true,
  resetMocks: false,
  coverageDirectory: "../coverage",
  collectCoverageFrom: [
    "**/*.ts",
    "!**/__tests__/**",
    "!**/index.ts",
    "!**/@types/**",
  ],
};

export default config;
