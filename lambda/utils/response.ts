export const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE',
};

export const response = (statusCode: number, data: object) => ({
  statusCode,
  headers,
  body: JSON.stringify(data),
});

export const ok = (data: object) => response(200, data);

export const badRequest = (message: string, errors?: Record<string, string[]>) =>
  response(400, { message, errors });

export const notFound = (message = 'Note not found') => response(404, { message });

export const internalError = () => response(500, { message: 'Internal Server Error' });
