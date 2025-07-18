import type React from "react"
import type { ReactElement } from "react"
import { render, type RenderOptions } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

// Add custom providers here (ThemeProvider, etc)
function AllProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

// Custom render method with providers built-in
function customRender(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, { wrapper: AllProviders, ...options })
}

// Re-export everything from testing-library
export * from "@testing-library/react"

// Override render method and export userEvent
export { customRender as render, userEvent }
