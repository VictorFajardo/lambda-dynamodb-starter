import 'dotenv/config';

export const headers = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE',
};

export const response = (statusCode: number, data: object) => {
  console.log('🚀', JSON.stringify(process.env));
  console.log('🚀', process.env.ALLOWED_ORIGIN);

  return {
    statusCode,
    headers,
    body: JSON.stringify(data),
  }
};

export const ok = (data: object) => response(200, data);

export const badRequest = (message: string, errors?: Record<string, string[]>) =>
  response(400, { message, errors });

export const notFound = (message = 'Note not found') => response(404, { message });

export const internalError = () => response(500, { message: 'Internal Server Error' });
