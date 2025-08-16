// utils/errorManager.ts
import { badRequest, notFound, unauthorized, forbidden, conflict, internalError } from './response';
import { ValidationError } from './validate';

export function handleError(error: unknown, context?: { id?: string }) {
  // 1️⃣ Validation errors
  if (error instanceof ValidationError) {
    return badRequest(error.message, error.details.flatten().fieldErrors);
  }

  // 2️⃣ DynamoDB / resource not found
  if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
    return notFound(`Resource${context?.id ? ` with id "${context.id}"` : ''} not found`);
  }

  // 3️⃣ Cognito / authorization errors
  if (error instanceof Error && error.name === 'NotAuthorizedException') {
    return unauthorized('You are not authorized to perform this action');
  }

  if (error instanceof Error && error.name === 'AccessDeniedException') {
    return forbidden('Access denied for this resource');
  }

  // 4️⃣ Conflict / duplicate errors
  if (error instanceof Error && error.name === 'ResourceConflictException') {
    return conflict(error.message);
  }

  // 5️⃣ Generic fallback
  return internalError(error);
}
