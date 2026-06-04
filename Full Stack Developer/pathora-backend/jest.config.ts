
import type { Config } from "jest";
const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^nanoid$": "<rootDir>/tests/__mocks__/nanoid.ts",
    "^(\\.\\.?/.*)\\.js$": "$1",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  testMatch: ["<rootDir>/tests/**/*.test.ts", "<rootDir>/tests/**/*.spec.ts"],
  setupFiles: ["<rootDir>/tests/setup-env.ts"],
  globalTeardown: "<rootDir>/tests/global-teardown.ts",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "./tsconfig.test.json",
        diagnostics: {
          ignoreCodes: ["TS151001"],
        },
      },
    ],
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/server.ts"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  testTimeout: 30_000,
  verbose: true,
};
export default config;
