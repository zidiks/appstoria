const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_RETRY_DELAY_MS = 400;
const RETRYABLE_STATUSES = new Set([408, 500, 502, 503, 504]);

export class ApiRequestError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ApiRequestError';
    this.url = details.url;
    this.status = details.status;
    this.code = details.code;
    this.reason = details.reason;
    this.payload = details.payload;
    this.responseBody = details.responseBody;
  }
}

export async function fetchJson(url, options = {}) {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries: configuredRetries,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    acceptedStatuses = [],
    ...fetchOptions
  } = options;
  const method = (fetchOptions.method || 'GET').toUpperCase();
  const retries = configuredRetries ?? (method === 'GET' ? 1 : 0);

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        method,
        signal: controller.signal,
      });
      const responseBody = await response.text();
      const contentType = response.headers.get('content-type') || '';
      const hasJsonContentType = contentType.toLowerCase().includes('json');
      let payload = null;

      if (responseBody) {
        if (!hasJsonContentType) {
          throw new ApiRequestError(
            response.ok
              ? 'API returned an unexpected content type'
              : `API request failed with status ${response.status}`,
            {
              url,
              status: response.status,
              code: 'INVALID_RESPONSE',
              responseBody: responseBody.slice(0, 200),
            },
          );
        }

        try {
          payload = JSON.parse(responseBody);
        } catch (error) {
          throw new ApiRequestError('API returned invalid JSON', {
            url,
            status: response.status,
            code: 'INVALID_JSON',
            responseBody: responseBody.slice(0, 200),
          });
        }
      }

      if (!response.ok && !acceptedStatuses.includes(response.status)) {
        throw new ApiRequestError(
          payload?.message || `API request failed with status ${response.status}`,
          {
            url,
            status: response.status,
            code: 'HTTP_ERROR',
            reason: payload?.reason || payload?.error,
            payload,
            responseBody: responseBody.slice(0, 200),
          },
        );
      }

      return payload;
    } catch (error) {
      const requestError = normalizeRequestError(error, url, timeoutMs);
      const shouldRetry =
        attempt < retries &&
        method === 'GET' &&
        isTemporaryApiError(requestError);

      if (shouldRetry) {
        await wait(retryDelayMs * (attempt + 1));
        continue;
      }

      logRequestError(requestError, method);
      throw requestError;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function isTemporaryApiError(error) {
  return Boolean(
    error instanceof ApiRequestError &&
      (error.code === 'NETWORK_ERROR' ||
        error.code === 'TIMEOUT' ||
        error.code === 'INVALID_RESPONSE' ||
        error.code === 'INVALID_JSON' ||
        RETRYABLE_STATUSES.has(error.status)),
  );
}

function normalizeRequestError(error, url, timeoutMs) {
  if (error instanceof ApiRequestError) {
    return error;
  }

  if (error?.name === 'AbortError') {
    return new ApiRequestError(`API request timed out after ${timeoutMs} ms`, {
      url,
      status: 408,
      code: 'TIMEOUT',
    });
  }

  return new ApiRequestError(error?.message || 'API request failed', {
    url,
    code: 'NETWORK_ERROR',
  });
}

function logRequestError(error, method) {
  console.error('[API request failed]', {
    method,
    url: error.url,
    status: error.status,
    code: error.code,
    message: error.message,
    responseBody: error.responseBody,
  });
}

function wait(delayMs) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}
