import { z } from "zod";
import type { ParsedJinjaVariable } from "./jinja-parser";

/**
 * Creates a Zod validation schema for a single variable based on its metadata
 */
export function createVariableSchema(
  variable: ParsedJinjaVariable
): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  // Base schema by type
  switch (variable.type) {
    case "number":
      schema = z.coerce.number({
        required_error: `${variable.name} is required`,
        invalid_type_error: `${variable.name} must be a number`,
      });
      break;
    case "boolean":
      schema = z.boolean({
        required_error: `${variable.name} is required`,
        invalid_type_error: `${variable.name} must be true or false`,
      });
      break;
    case "text":
      schema = z.string({
        required_error: `${variable.name} is required`,
      });
      break;
    default:
      // Default to string
      schema = z.string({
        required_error: `${variable.name} is required`,
      });
  }

  // Apply string validations
  if (schema instanceof z.ZodString) {
    // Min length
    if (variable.minLength !== undefined) {
      schema = schema.min(
        variable.minLength,
        `${variable.name} must be at least ${variable.minLength} characters`
      );
    }

    // Max length
    if (variable.maxLength !== undefined) {
      schema = schema.max(
        variable.maxLength,
        `${variable.name} must not exceed ${variable.maxLength} characters`
      );
    }

    // Email validation
    if (variable.type === "email") {
      schema = schema.email(`${variable.name} must be a valid email address`);
    }

    // URL validation
    if (variable.type === "url") {
      schema = schema.url(`${variable.name} must be a valid URL`);
    }
  }

  // Apply number validations
  if (schema instanceof z.ZodNumber) {
    // Min value
    if (variable.minLength !== undefined) {
      schema = schema.min(
        variable.minLength,
        `${variable.name} must be at least ${variable.minLength}`
      );
    }

    // Max value
    if (variable.maxLength !== undefined) {
      schema = schema.max(
        variable.maxLength,
        `${variable.name} must not exceed ${variable.maxLength}`
      );
    }
  }

  // Apply required/optional status
  if (variable.isRequired === false) {
    schema = schema.optional();
  }

  return schema;
}

/**
 * Generates a complete Zod schema object from a list of variables
 */
export function generateVariablesSchema(
  variables: ParsedJinjaVariable[]
): z.ZodObject<any> {
  const schemaObj: Record<string, z.ZodTypeAny> = {};

  variables.forEach((variable) => {
    schemaObj[variable.name] = createVariableSchema(variable);
  });

  return z.object(schemaObj);
}

/**
 * Creates default values for variables based on their metadata
 */
export function generateDefaultValues(
  variables: ParsedJinjaVariable[]
): Record<string, any> {
  const defaults: Record<string, any> = {};

  variables.forEach((variable) => {
    let value: any = variable.defaultValue || "";

    // Convert to appropriate type
    if (variable.type === "number") {
      value = variable.defaultValue ? Number(variable.defaultValue) : 0;
    } else if (variable.type === "boolean") {
      value = variable.defaultValue === "true";
    }

    defaults[variable.name] = value;
  });

  return defaults;
}
