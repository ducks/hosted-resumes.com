import type { ZodError } from "zod";
import {
  JoblResumeSchema,
  PartialJoblResumeSchema,
  type JoblResume,
  type PartialJoblResume,
} from "./schema.js";

export interface ValidationError {
  path: string;
  message: string;
}

export interface ValidationSuccess<T> {
  success: true;
  data: T;
}

export interface ValidationFailure {
  success: false;
  errors: ValidationError[];
}

export type ValidationResult<T> =
  | ValidationSuccess<T>
  | ValidationFailure;

function flattenErrors(error: ZodError): ValidationError[] {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

// Strict validation for API boundaries
export function validateResume(
  data: unknown
): ValidationResult<JoblResume> {
  const result = JoblResumeSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: flattenErrors(result.error) };
}

// Lenient validation for editor autosave
export function validatePartial(
  data: unknown
): ValidationResult<PartialJoblResume> {
  const result = PartialJoblResumeSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: flattenErrors(result.error) };
}

// Factory for new resume creation
export function emptyResume(): JoblResume {
  return {
    jobl_version: "0.1.0",
    person: {
      name: "",
    },
  };
}
