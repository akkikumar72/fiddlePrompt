import React from "react";
import { render, screen, fireEvent } from "@/lib/test-utils";
import MainEditor from "./main-editor";

// Mock necessary dependencies for the test
jest.mock("@monaco-editor/react", () => ({
  __esModule: true,
  default: ({ value, onChange, language }) => {
    return (
      <div data-testid={`monaco-editor-${language}`}>
        <textarea
          data-testid={`monaco-editor-textarea-${language}`}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </div>
    );
  },
}));

describe("MainEditor", () => {
  it("should render system and user prompt editors", () => {
    render(<MainEditor />);

    // Check if the editors are rendered
    expect(screen.getByTestId("monaco-editor-jinja2")).toBeInTheDocument();
    expect(
      screen.getByTestId("monaco-editor-textarea-jinja2")
    ).toBeInTheDocument();

    // Check for editor labels
    expect(screen.getByText(/system prompt/i)).toBeInTheDocument();
    expect(screen.getByText(/user prompt/i)).toBeInTheDocument();
  });

  it("should detect variables when typing in editors", () => {
    render(<MainEditor />);

    // Get the system prompt editor textarea
    const systemPromptEditor = screen.getByTestId(
      "monaco-editor-textarea-jinja2"
    );

    // Simulate typing a template with variables
    fireEvent.change(systemPromptEditor, {
      target: {
        value: "Hello {{ name:string! }}, your age is {{ age:number? }}",
      },
    });

    // Wait for variable detection (needs to be updated to use waitFor if async)
    expect(screen.getByText(/variables/i)).toBeInTheDocument();

    // Check if variable inputs are generated
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
  });

  it("should handle variable type badges correctly", async () => {
    render(<MainEditor />);

    // Get the system prompt editor textarea
    const systemPromptEditor = screen.getByTestId(
      "monaco-editor-textarea-jinja2"
    );

    // Simulate typing a template with different variable types
    fireEvent.change(systemPromptEditor, {
      target: {
        value: `
          Name: {{ name:string! }}
          Age: {{ age:number }}
          Description: {{ description:text }}
          Active: {{ isActive:boolean }}
        `,
      },
    });

    // Check if type badges are rendered correctly
    expect(screen.getByText("string")).toBeInTheDocument();
    expect(screen.getByText("number")).toBeInTheDocument();
    expect(screen.getByText("text")).toBeInTheDocument();
    expect(screen.getByText("boolean")).toBeInTheDocument();
  });
});
