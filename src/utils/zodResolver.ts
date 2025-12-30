/**
 * Custom Zod resolver for react-hook-form
 * 
 * This is a simple implementation to avoid requiring @hookform/resolvers package.
 * For production, consider using @hookform/resolvers/zod for better performance.
 */

import { z } from 'zod';
import type { FieldValues, ResolverOptions, ResolverResult } from 'react-hook-form';

type FieldValuesConstraint = Record<string, unknown>;

/**
 * Create a resolver function for react-hook-form using Zod schema
 * 
 * @param schema - Zod schema to validate against
 * @returns Resolver function for react-hook-form
 */
export function zodResolver<T extends z.ZodType<FieldValuesConstraint>>(
  schema: T
) {
  return async (
    values: FieldValues,
    _context: unknown,
    _options: ResolverOptions<z.infer<T>>
  ): Promise<ResolverResult<z.infer<T>>> => {
    try {
      const validatedData = await schema.parseAsync(values);
      return {
        values: validatedData as z.infer<T> & FieldValues,
        errors: {},
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, { type: string; message: string }> = {};
        
        error.issues.forEach((issue) => {
          const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
          fieldErrors[path] = {
            type: issue.code,
            message: issue.message,
          };
        });

        return {
          values: {} as z.infer<T> & FieldValues,
          errors: fieldErrors as any,
        };
      }
      
      return {
        values: {} as z.infer<T> & FieldValues,
        errors: {
          root: {
            type: 'unknown',
            message: 'Une erreur de validation est survenue',
          },
        } as any,
      };
    }
  };
}

