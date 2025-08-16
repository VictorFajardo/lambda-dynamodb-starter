// Define headers for CORS
export const headers = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN ?? '*',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
};

// Generic response builder
export const response = (
  statusCode: number,
  data: unknown,
  extraHeaders: Record<string, string> = {}
) => {
  return {
    statusCode,
    headers: { ...headers, ...extraHeaders },
    body: JSON.stringify(data),
  };
};

// Convenience helpers
export const ok = (data: unknown) => response(200, data);

export const created = (data: unknown) => response(201, data);

export const noContent = () => ({
  statusCode: 204,
  headers,
  body: '',
});

export const badRequest = (message: string, errors?: Record<string, string[]>) =>
  response(400, { message, errors });

export const unauthorized = (message = 'Unauthorized') => response(401, { message });

export const forbidden = (message = 'Forbidden') => response(403, { message });

export const notFound = (message = 'Resource not found') => response(404, { message });

export const conflict = (message = 'Conflict') => response(409, { message });

export const internalError = (error?: unknown) =>
  response(500, {
    message: 'Internal Server Error',
    error: error instanceof Error ? error.message : String(error),
  });
