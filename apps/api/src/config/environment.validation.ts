type Environment = {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  WEB_ORIGIN: string;
  DATABASE_URL: string;
};

const validNodeEnvironments = ['development', 'test', 'production'] as const;

function parsePort(value: unknown): number {
  if (value === undefined || value === '') {
    return 3000;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  return port;
}

function parseNodeEnvironment(value: unknown): Environment['NODE_ENV'] {
  const nodeEnvironment = value ?? 'development';

  if (
    typeof nodeEnvironment !== 'string' ||
    !validNodeEnvironments.includes(nodeEnvironment as Environment['NODE_ENV'])
  ) {
    throw new Error(
      `NODE_ENV must be one of: ${validNodeEnvironments.join(', ')}.`,
    );
  }

  return nodeEnvironment as Environment['NODE_ENV'];
}

function parseWebOrigin(value: unknown): string {
  const webOrigin =
    typeof value === 'string' && value.trim().length > 0
      ? value.trim()
      : 'http://localhost:5173';

  try {
    const url = new URL(webOrigin);

    return url.origin;
  } catch {
    throw new Error('WEB_ORIGIN must be a valid URL.');
  }
}

function parseDatabaseUrl(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error('DATABASE_URL is required.');
  }

  const databaseUrl = value.trim();

  try {
    const url = new URL(databaseUrl);

    if (!['postgresql:', 'postgres:'].includes(url.protocol)) {
      throw new Error();
    }

    return databaseUrl;
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection URL.');
  }
}

export function validateEnvironment(
  configuration: Record<string, unknown>,
): Environment {
  return {
    NODE_ENV: parseNodeEnvironment(configuration.NODE_ENV),
    PORT: parsePort(configuration.PORT),
    WEB_ORIGIN: parseWebOrigin(configuration.WEB_ORIGIN),
    DATABASE_URL: parseDatabaseUrl(configuration.DATABASE_URL),
  };
}
