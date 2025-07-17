export interface ParsedJinjaVariable {
  name: string;
  fullMatch: string;
  defaultValue?: string;
  type?: string;
  isRequired?: boolean;
  description?: string;
  minLength?: number;
  maxLength?: number;
}

// More comprehensive regex to extract variables with potential type hints and default values
// Matches patterns like:
// {{ variable }}
// {{ variable | default('value') }}
// {{ variable:string }}
// {{ variable:number | default(0) }}
// {{ variable:string? }} (optional)
// {{ variable:string! }} (required)
// {{ variable:string[min=3,max=10] }} (with validation)
const JINJA_VARIABLE_REGEX =
  /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)(?::([a-z]+))?(\?|!)?(?:\[([^\]]+)\])?(?:\s*\|\s*default\(['"]?([^'"()]*)['"]?\))?(?:\s*\|\s*[a-z]+(?:\([^)]*\))?)*\s*\}\}/gi;

export function extractVariablesWithMetadata(
  text: string
): ParsedJinjaVariable[] {
  const variables: ParsedJinjaVariable[] = [];
  const matches = Array.from(text.matchAll(JINJA_VARIABLE_REGEX));

  matches.forEach((match) => {
    const fullMatch = match[0];
    const name = match[1];
    const type = match[2]; // e.g., "string", "number"
    const requiredFlag = match[3]; // ? for optional, ! for required
    const validationStr = match[4]; // e.g., "min=3,max=10"
    const defaultValue = match[5];

    const variable: ParsedJinjaVariable = {
      name,
      fullMatch,
      type: type || "string", // Default to string if not specified
    };

    // Set default value if present
    if (defaultValue !== undefined) {
      variable.defaultValue = defaultValue;
    }

    // Process required flag
    if (requiredFlag) {
      variable.isRequired = requiredFlag === "!";
    }

    // Process validation constraints
    if (validationStr) {
      const validations = validationStr.split(",");
      validations.forEach((validation) => {
        const [key, value] = validation.split("=");
        if (key === "min") {
          variable.minLength = parseInt(value);
        } else if (key === "max") {
          variable.maxLength = parseInt(value);
        } else if (key === "description") {
          variable.description = value.replace(/['"]/g, "");
        }
      });
    }

    variables.push(variable);
  });

  // Basic deduplication by variable name
  // We keep the first occurrence which has the most metadata
  const deduplicated = variables.reduce<Record<string, ParsedJinjaVariable>>(
    (acc, variable) => {
      if (!acc[variable.name]) {
        acc[variable.name] = variable;
      }
      return acc;
    },
    {}
  );

  return Object.values(deduplicated);
}

export function extractSimpleVariables(text: string): string[] {
  const variables = extractVariablesWithMetadata(text);
  return variables.map((v) => v.name);
}

export function combineVariables(texts: string[]): ParsedJinjaVariable[] {
  const allVariables: ParsedJinjaVariable[] = [];

  texts.forEach((text) => {
    const extracted = extractVariablesWithMetadata(text);
    allVariables.push(...extracted);
  });

  // Deduplicate by name, prioritizing variables with more metadata
  return Object.values(
    allVariables.reduce<Record<string, ParsedJinjaVariable>>(
      (acc, variable) => {
        const existingVar = acc[variable.name];
        if (
          !existingVar ||
          ((!existingVar.type || !existingVar.defaultValue) &&
            (variable.type || variable.defaultValue))
        ) {
          acc[variable.name] = variable;
        }
        return acc;
      },
      {}
    )
  );
}

// Helper for simple matching of any Jinja2 syntax (for syntax highlighting, etc.)
export const JINJA_SYNTAX_PATTERNS = {
  VARIABLE: /\{\{.*?\}\}/g,
  TAG: /\{%.*?%\}/g,
  COMMENT: /\{#.*?#\}/g,
};
