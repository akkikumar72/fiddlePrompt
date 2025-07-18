import {
  extractVariablesWithMetadata,
  extractSimpleVariables,
  combineVariables,
  type ParsedJinjaVariable
} from "./jinja-parser"

describe("Jinja Parser", () => {
  describe("extractVariablesWithMetadata", () => {
    it("should extract basic variables", () => {
      const template = "Hello {{ name }}, welcome to {{ service }}!"
      const variables = extractVariablesWithMetadata(template)

      expect(variables).toHaveLength(2)
      expect(variables[0].name).toBe("name")
      expect(variables[1].name).toBe("service")
    })

    it("should extract variables with type hints", () => {
      const template = "Hello {{ name:string }}, your age is {{ age:number }}"
      const variables = extractVariablesWithMetadata(template)

      expect(variables).toHaveLength(2)
      expect(variables[0].name).toBe("name")
      expect(variables[0].type).toBe("string")
      expect(variables[1].name).toBe("age")
      expect(variables[1].type).toBe("number")
    })

    it("should extract required/optional flags", () => {
      const template = "Hello {{ name:string! }}, optional: {{ email:string? }}"
      const variables = extractVariablesWithMetadata(template)

      expect(variables).toHaveLength(2)
      expect(variables[0].name).toBe("name")
      expect(variables[0].isRequired).toBe(true)
      expect(variables[1].name).toBe("email")
      expect(variables[1].isRequired).toBe(false)
    })

    it("should extract validation constraints", () => {
      const template = "{{ username:string[min=3,max=20] }}"
      const variables = extractVariablesWithMetadata(template)

      expect(variables).toHaveLength(1)
      expect(variables[0].name).toBe("username")
      expect(variables[0].minLength).toBe(3)
      expect(variables[0].maxLength).toBe(20)
    })

    it("should extract default values", () => {
      const template = "{{ name | default('User') }} and {{ age | default(25) }}"
      const variables = extractVariablesWithMetadata(template)

      expect(variables).toHaveLength(2)
      expect(variables[0].name).toBe("name")
      expect(variables[0].defaultValue).toBe("User")
      expect(variables[1].name).toBe("age")
      expect(variables[1].defaultValue).toBe("25")
    })

    it("should handle complex variables with multiple attributes", () => {
      const template = "{{ username:string![min=3,max=20] | default('guest') }}"
      const variables = extractVariablesWithMetadata(template)

      expect(variables).toHaveLength(1)
      expect(variables[0].name).toBe("username")
      expect(variables[0].type).toBe("string")
      expect(variables[0].isRequired).toBe(true)
      expect(variables[0].minLength).toBe(3)
      expect(variables[0].maxLength).toBe(20)
      expect(variables[0].defaultValue).toBe("guest")
    })

    it("should deduplicate variables", () => {
      const template = "{{ name }} and {{ name }} and {{ name }}"
      const variables = extractVariablesWithMetadata(template)

      expect(variables).toHaveLength(1)
      expect(variables[0].name).toBe("name")
    })

    it("should handle variables with filters", () => {
      const template = "{{ name | uppercase | trim }}"
      const variables = extractVariablesWithMetadata(template)

      expect(variables).toHaveLength(1)
      expect(variables[0].name).toBe("name")
    })

    it("should ignore tags and comments", () => {
      const template = "{{ name }} {% if condition %}{{ age }}{% endif %} {# comment #}"
      const variables = extractVariablesWithMetadata(template)

      expect(variables).toHaveLength(2)
      expect(variables[0].name).toBe("name")
      expect(variables[1].name).toBe("age")
    })
  })

  describe("extractSimpleVariables", () => {
    it("should extract only variable names", () => {
      const template = "{{ name:string![min=3] | default('user') }} and {{ age:number }}"
      const variables = extractSimpleVariables(template)

      expect(variables).toEqual(["name", "age"])
    })
  })

  describe("combineVariables", () => {
    it("should combine variables from multiple templates", () => {
      const template1 = "Hello {{ name }}"
      const template2 = "Your age is {{ age }}"

      const combined = combineVariables([template1, template2])

      expect(combined).toHaveLength(2)
      expect(combined[0].name).toBe("name")
      expect(combined[1].name).toBe("age")
    })

    it("should deduplicate variables across templates", () => {
      const template1 = "Hello {{ name }}"
      const template2 = "Hello again {{ name }}"

      const combined = combineVariables([template1, template2])

      expect(combined).toHaveLength(1)
      expect(combined[0].name).toBe("name")
    })

    it("should prioritize variables with more metadata", () => {
      const template1 = "{{ name }}"
      const template2 = "{{ name:string | default('user') }}"

      const combined = combineVariables([template1, template2])

      expect(combined).toHaveLength(1)
      expect(combined[0].name).toBe("name")
      expect(combined[0].type).toBe("string")
      expect(combined[0].defaultValue).toBe("user")
    })
  })
})
