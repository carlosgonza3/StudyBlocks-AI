const DEFAULT_API_BASE_URL = 'http://localhost:3000/api/v1';

const apiBaseUrl = (
    import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL
).replace(/\/$/, '');

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
    body?: unknown;
};

export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly payload: unknown,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

function getErrorMessage(payload: unknown, fallback: string): string {
    if (
        typeof payload === 'object' &&
        payload !== null &&
        'message' in payload
    ) {
        const message = (payload as { message: unknown }).message;

        if (Array.isArray(message)) {
            return message.join(', ');
        }

        if (typeof message === 'string') {
            return message;
        }
    }

    return fallback;
}

async function parseResponse(response: Response): Promise<unknown> {
    const text = await response.text();

    if (!text) {
        return null;
    }

    return JSON.parse(text) as unknown;
}

export async function apiRequest<T>(
    path: string,
    options: ApiRequestOptions = {},
): Promise<T> {
    const headers = new Headers(options.headers);
    let body: BodyInit | undefined;

    if (options.body !== undefined) {
        headers.set('Content-Type', 'application/json');
        body = JSON.stringify(options.body);
    }

    const response = await fetch(`${apiBaseUrl}${path}`, {
        ...options,
        headers,
        body,
    });

    const payload = await parseResponse(response);

    if (!response.ok) {
        throw new ApiError(
            getErrorMessage(payload, 'The API request failed.'),
            response.status,
            payload,
        );
    }

    return payload as T;
}