import { response } from '../../utils/response';

export const handler = async () => {
  return response(
    204,
    {},
    {
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN ?? '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
    }
  );
};
