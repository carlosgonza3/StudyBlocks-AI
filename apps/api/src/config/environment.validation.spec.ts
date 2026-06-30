import { describe, expect, it } from '@jest/globals';

import { validateEnvironment } from './environment.validation';

describe('validateEnvironment', () => {
  it('returns default local-development values', () => {
    expect(validateEnvironment({})).toEqual({
      NODE_ENV: 'development',
      PORT: 3000,
      WEB_ORIGIN: 'http://localhost:5173',
    });
  });

  it('converts the port environment variable to a number', () => {
    const result = validateEnvironment({
      PORT: '4000',
    });

    expect(result.PORT).toBe(4000);
  });

  it('accepts all supported Node environments', () => {
    for (const nodeEnvironment of ['development', 'test', 'production']) {
      expect(
        validateEnvironment({
          NODE_ENV: nodeEnvironment,
        }).NODE_ENV,
      ).toBe(nodeEnvironment);
    }
  });

  it('rejects an unsupported Node environment', () => {
    expect(() =>
      validateEnvironment({
        NODE_ENV: 'staging',
      }),
    ).toThrow('NODE_ENV must be one of: development, test, production.');
  });

  it('rejects a non-numeric port', () => {
    expect(() =>
      validateEnvironment({
        PORT: 'not-a-port',
      }),
    ).toThrow('PORT must be an integer between 1 and 65535.');
  });

  it('rejects a port outside the valid range', () => {
    expect(() =>
      validateEnvironment({
        PORT: '70000',
      }),
    ).toThrow('PORT must be an integer between 1 and 65535.');
  });

  it('normalizes the configured web origin', () => {
    const result = validateEnvironment({
      WEB_ORIGIN: 'https://studyblocks.example.com/path',
    });

    expect(result.WEB_ORIGIN).toBe('https://studyblocks.example.com');
  });

  it('rejects an invalid web origin', () => {
    expect(() =>
      validateEnvironment({
        WEB_ORIGIN: 'not a valid URL',
      }),
    ).toThrow('WEB_ORIGIN must be a valid URL.');
  });
});
