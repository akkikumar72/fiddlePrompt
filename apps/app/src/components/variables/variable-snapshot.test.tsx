import { render } from "@/lib/test-utils";
import { VariableForm } from "./variable-form";
import { ParsedJinjaVariable } from "@/lib/jinja-parser";

describe("VariableForm Snapshots", () => {
  const mockVariables: ParsedJinjaVariable[] = [
    {
      name: "name",
      type: "string",
      defaultValue: "John Doe",
      isRequired: true,
    },
    {
      name: "age",
      type: "number",
      defaultValue: "25",
      isRequired: false,
    },
    {
      name: "bio",
      type: "text",
      defaultValue: "",
      isRequired: false,
    },
    {
      name: "isActive",
      type: "boolean",
      defaultValue: "true",
      isRequired: true,
    },
  ];

  it("should render correctly with variables", () => {
    const { container } = render(
      <VariableForm variables={mockVariables} onValuesChange={() => {}} />
    );
    expect(container).toMatchSnapshot();
  });

  it("should render empty state when no variables provided", () => {
    const { container } = render(
      <VariableForm variables={[]} onValuesChange={() => {}} />
    );
    expect(container).toMatchSnapshot();
  });
});
