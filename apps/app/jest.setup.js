// jest.setup.js
import "@testing-library/jest-dom";
import { jest } from "@jest/globals";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: "/",
    query: {},
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock ResizeObserver which isn't available in the Jest environment
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock Monaco Editor which might cause issues in tests
jest.mock("@monaco-editor/react", () => {
  return {
    __esModule: true,
    default: ({ value, onChange }) => {
      return (
        <div
          data-testid="monaco-editor"
          onChange={(e) => onChange?.(e.target.value)}
        >
          {value}
        </div>
      );
    },
  };
});
