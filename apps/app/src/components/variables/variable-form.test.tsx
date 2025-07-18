import { render, screen, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { VariableForm } from "./variable-form"
import type { ParsedJinjaVariable } from "@/lib/jinja-parser"

describe("VariableForm", () => {
  // Sample variables for testing
  const testVariables: ParsedJinjaVariable[] = [
    {
      name: "name",
      fullMatch: "{{ name:string[min=2,max=20] }}",
      type: "string",
      minLength: 2,
      maxLength: 20
    },
    {
      name: "age",
      fullMatch: "{{ age:number }}",
      type: "number"
    },
    {
      name: "isStudent",
      fullMatch: "{{ isStudent:boolean }}",
      type: "boolean"
    },
    {
      name: "bio",
      fullMatch: "{{ bio:text }}",
      type: "text",
      isRequired: false
    }
  ]

  it("should render all variable inputs", () => {
    render(<VariableForm variables={testVariables} />)

    // Check for all variable labels
    expect(screen.getByText("name")).toBeInTheDocument()
    expect(screen.getByText("age")).toBeInTheDocument()
    expect(screen.getByText("isStudent")).toBeInTheDocument()
    expect(screen.getByText("bio")).toBeInTheDocument()

    // Check for proper input types
    expect(screen.getByPlaceholderText("Enter value for name")).toHaveAttribute("type", "text")
    expect(screen.getByPlaceholderText("Enter value for age")).toHaveAttribute("type", "number")
    expect(screen.getByPlaceholderText("Enter value for bio")).toBeInTheDocument()

    // Check for Switch (boolean) component
    expect(screen.getByRole("switch")).toBeInTheDocument()
  })

  it("should render badges with variable types", () => {
    render(<VariableForm variables={testVariables} />)

    expect(screen.getByText("string")).toBeInTheDocument()
    expect(screen.getByText("number")).toBeInTheDocument()
    expect(screen.getByText("boolean")).toBeInTheDocument()
    expect(screen.getByText("text")).toBeInTheDocument()
  })

  it("should show empty state when no variables are provided", () => {
    render(<VariableForm variables={[]} />)

    expect(screen.getByText("No variables detected")).toBeInTheDocument()
    expect(screen.getByText("Use {{ variable_name }} syntax to add variables")).toBeInTheDocument()
  })

  it("should call onValuesChange when input values change", () => {
    const mockOnValuesChange = jest.fn()
    render(<VariableForm variables={testVariables} onValuesChange={mockOnValuesChange} />)

    // Update name field
    fireEvent.change(screen.getByPlaceholderText("Enter value for name"), {
      target: { value: "John" }
    })

    // We expect onValuesChange to be called
    expect(mockOnValuesChange).toHaveBeenCalled()
  })

  it("should call onSubmit when form is submitted", () => {
    const mockOnSubmit = jest.fn()
    render(<VariableForm variables={testVariables} onSubmit={mockOnSubmit} />)

    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText("Enter value for name"), {
      target: { value: "John" }
    })

    fireEvent.change(screen.getByPlaceholderText("Enter value for age"), {
      target: { value: "30" }
    })

    // Submit the form
    fireEvent.submit(screen.getByRole("form"))

    // We expect onSubmit to be called
    expect(mockOnSubmit).toHaveBeenCalled()
  })

  it("should display validation errors", async () => {
    render(<VariableForm variables={testVariables} />)

    // Fill name field with invalid value (too short)
    fireEvent.change(screen.getByPlaceholderText("Enter value for name"), {
      target: { value: "a" } // Only 1 char, but min is 2
    })

    // Submit the form
    fireEvent.submit(screen.getByRole("form"))

    // We expect validation error message
    expect(await screen.findByText(/name must be at least 2 characters/i)).toBeInTheDocument()
  })

  it("should switch between different input types based on variable type", () => {
    const variables: ParsedJinjaVariable[] = [
      {
        name: "regular",
        fullMatch: "{{ regular }}",
        type: "string"
      },
      {
        name: "longText",
        fullMatch: "{{ longText:text }}",
        type: "text"
      }
    ]

    render(<VariableForm variables={variables} />)

    // Regular string should render an Input
    const regularInput = screen.getByPlaceholderText("Enter value for regular")
    expect(regularInput.tagName).toBe("INPUT")

    // Text type should render a Textarea
    const textareaInput = screen.getByPlaceholderText("Enter value for longText")
    expect(textareaInput.tagName).toBe("TEXTAREA")
  })
})
