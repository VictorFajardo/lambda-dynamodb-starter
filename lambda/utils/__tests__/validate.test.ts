import { z } from 'zod';
import { validate, ValidationError } from '../validate';

describe('validate utility', () => {
    const schema = z.object({
        content: z.string().min(1),
    });

    it('returns validated data when input is valid', () => {
        const data = { content: 'Valid note' };
        const result = validate(schema, data);
        expect(result).toEqual(data);
    });

    it('throws ValidationError when input is invalid', () => {
        const invalidData = { content: '' }; // fails min(1)

        try {
            validate(schema, invalidData);
            // fail test if no error is thrown
            fail('Expected ValidationError to be thrown');
        } catch (error: unknown) {
            if (error instanceof ValidationError) {
                expect(error.details.issues.length).toBeGreaterThan(0);
                expect(error.details.issues[0].message).toMatch("Too small: expected string to have >=1 characters");
            } else {
                fail(`Unexpected error thrown: ${JSON.stringify(error)}`);
            }
        }
    });

    it('ValidationError has correct message and prototype', () => {
        const invalidData = {};

        try {
            validate(schema, invalidData);
            fail('Expected ValidationError to be thrown');
        } catch (error: unknown) {
            if (error instanceof ValidationError) {
                expect(error.message).toBe('Validation failed');
                expect(Object.getPrototypeOf(error)).toBe(ValidationError.prototype);
            } else {
                fail(`Unexpected error thrown: ${JSON.stringify(error)}`);
            }
        }
    });
});
