import { describe, expect, it } from '@jest/globals';

import { validateEnvironment } from './environment.validation';

const validDatabaseUrl =
  'postgresql://studyblocks:studyblocks_password@localhost:5432/studyblocks_dev?schema=public';

describe('validateEnvironment', () => {
  it('returns default local-development values when optional values are missing', () => {
    expect(
      validateEnvironment({
        DATABASE_URL: validDatabaseUrl,
      }),
    ).toEqual({
      NODE_ENV: 'development',
      PORT: 3000,
      WEB_ORIGIN: 'http://localhost:5173',
      DATABASE_URL: validDatabaseUrl,
    });
  });

  it('converts the port environment variable to a number', () => {
    const result = validateEnvironment({
      PORT: '4000',
      DATABASE_URL: validDatabaseUrl,
    });

    expect(result.PORT).toBe(4000);
  });

  it('accepts all supported Node environments', () => {
    for (const nodeEnvironment of ['development', 'test', 'production']) {
      expect(
        validateEnvironment({
          NODE_ENV: nodeEnvironment,
          DATABASE_URL: validDatabaseUrl,
        }).NODE_ENV,
      ).toBe(nodeEnvironment);
    }
  });

  it('rejects an unsupported Node environment', () => {
    expect(() =>
      validateEnvironment({
        NODE_ENV: 'staging',
        DATABASE_URL: validDatabaseUrl,
      }),
    ).toThrow('NODE_ENV must be one of: development, test, production.');
  });

  it('rejects a non-numeric port', () => {
    expect(() =>
      validateEnvironment({
        PORT: 'not-a-port',
        DATABASE_URL: validDatabaseUrl,
      }),
    ).toThrow('PORT must be an integer between 1 and 65535.');
  });

  it('rejects a port outside the valid range', () => {
    expect(() =>
      validateEnvironment({
        PORT: '70000',
        DATABASE_URL: validDatabaseUrl,
      }),
    ).toThrow('PORT must be an integer between 1 and 65535.');
  });

  it('normalizes the configured web origin', () => {
    const result = validateEnvironment({
      WEB_ORIGIN: 'https://studyblocks.example.com/path',
      DATABASE_URL: validDatabaseUrl,
    });

    expect(result.WEB_ORIGIN).toBe('https://studyblocks.example.com');
  });

  it('rejects an invalid web origin', () => {
    expect(() =>
      validateEnvironment({
        WEB_ORIGIN: 'not a valid URL',
        DATABASE_URL: validDatabaseUrl,
      }),
    ).toThrow('WEB_ORIGIN must be a valid URL.');
  });

  it('requires a database URL', () => {
    expect(() => validateEnvironment({})).toThrow('DATABASE_URL is required.');
  });

  it('rejects an invalid database URL', () => {
    expect(() =>
      validateEnvironment({
        DATABASE_URL: 'not-a-url',
      }),
    ).toThrow('DATABASE_URL must be a valid PostgreSQL connection URL.');
  });

  it('rejects a non-PostgreSQL database URL', () => {
    expect(() =>
      validateEnvironment({
        DATABASE_URL: 'mysql://user:password@localhost:3306/db',
      }),
    ).toThrow('DATABASE_URL must be a valid PostgreSQL connection URL.');
  });
});
