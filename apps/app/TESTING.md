# FiddlePrompt Testing Guide

## Overview

This document provides guidance for testing the FiddlePrompt application. We use Jest and React Testing Library for our test suite.

## Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test:watch

# Run tests with coverage report
bun test:coverage
```

## Test Structure

Our tests are organized as follows:

1. **Unit Tests**: Test individual functions and utilities

   - Located alongside source files with `.test.ts` extension
   - Example: `jinja-parser.test.ts`

2. **Component Tests**: Test individual React components

   - Located alongside components with `.test.tsx` extension
   - Example: `variable-form.test.tsx`

3. **Integration Tests**: Test component interactions

   - Example: `main-editor.test.tsx`

4. **Snapshot Tests**: Verify UI renders consistently
   - Example: `variable-snapshot.test.tsx`

## Test Utilities

We provide several test utilities in `src/lib/test-utils.tsx`:

- Custom render function with providers
- Re-exports from React Testing Library
- User event simulation

## Writing Tests

### Unit Tests

```typescript
import { functionToTest } from "./module";

describe("functionToTest", () => {
  it("should handle valid inputs", () => {
    expect(functionToTest("valid input")).toBe("expected result");
  });

  it("should handle edge cases", () => {
    expect(functionToTest("")).toBe("default value");
  });
});
```

### Component Tests

```typescript
import { render, screen, fireEvent } from "@/lib/test-utils";
import MyComponent from "./my-component";

describe("MyComponent", () => {
  it("should render correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });

  it("should handle user interactions", () => {
    const onClickMock = jest.fn();
    render(<MyComponent onClick={onClickMock} />);

    fireEvent.click(screen.getByRole("button"));
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});
```

## Mock Dependencies

For components that depend on external services or complex browser APIs, we use Jest mocks:

```typescript
// Mock Monaco Editor
jest.mock("@monaco-editor/react", () => ({
  __esModule: true,
  default: ({ value, onChange }) => (
    <div data-testid="monaco-editor">
      <textarea value={value} onChange={(e) => onChange?.(e.target.value)} />
    </div>
  ),
}));
```

## Test Coverage

We aim for high test coverage, especially for:

- Core utilities (variable parsing, validation)
- Form components and validation
- User interactions and state management
- Edge cases in the variable extraction feature

Run `bun test:coverage` to generate a coverage report and identify areas needing additional testing.
