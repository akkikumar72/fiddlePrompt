"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ParsedJinjaVariable } from "@/lib/jinja-parser";
import {
  generateVariablesSchema,
  generateDefaultValues,
} from "@/lib/variable-validation";
import { Button } from "@v1/ui/button";
import { Input } from "@v1/ui/input";
import { Label } from "@v1/ui/label";
import { Textarea } from "@v1/ui/textarea";
import { Switch } from "@v1/ui/switch";
import { Badge } from "@v1/ui/badge";
import { Variable } from "lucide-react";

interface VariableFormProps {
  variables: ParsedJinjaVariable[];
  onSubmit?: (values: Record<string, any>) => void;
  onValuesChange?: (values: Record<string, any>) => void;
  className?: string;
}

export function VariableForm({
  variables,
  onSubmit,
  onValuesChange,
  className = "",
}: VariableFormProps) {
  // Generate form schema and default values
  const [defaultValues, setDefaultValues] = useState<Record<string, any>>({});
  const [prevVariables, setPrevVariables] = useState<ParsedJinjaVariable[]>([]);

  // Use a ref to track if we should notify parent of changes
  const shouldNotifyRef = useRef(false);
  const lastValuesRef = useRef<Record<string, any>>({});

  // Initialize the form with dynamic schema
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(generateVariablesSchema(variables)),
    defaultValues,
  });

  // Watch all form values for live updates
  const formValues = watch();

  // Manual submit handler that safely calls onValuesChange
  const handleFormSubmit = (data: Record<string, any>) => {
    lastValuesRef.current = data;
    if (onSubmit) {
      onSubmit(data);
    }
    // Only call onValuesChange on explicit submit to avoid loops
    if (onValuesChange) {
      onValuesChange(data);
    }
  };

  // Update schema and defaults when variables change
  useEffect(() => {
    // Skip if variables haven't changed
    const varsChanged =
      prevVariables.length !== variables.length ||
      variables.some(
        (v, i) =>
          !prevVariables[i] ||
          prevVariables[i].name !== v.name ||
          prevVariables[i].type !== v.type
      );

    if (!varsChanged) return;

    // Generate new default values from variables
    const newDefaults = generateDefaultValues(variables);

    // Preserve existing values when adding new fields
    const mergedDefaults = { ...newDefaults };
    Object.keys(lastValuesRef.current || {}).forEach((key) => {
      if (
        mergedDefaults[key] !== undefined &&
        lastValuesRef.current[key] !== undefined
      ) {
        mergedDefaults[key] = lastValuesRef.current[key];
      }
    });

    setDefaultValues(mergedDefaults);
    // Reset form with new defaults
    reset(mergedDefaults);
    setPrevVariables(variables);

    // Update the last values ref
    lastValuesRef.current = mergedDefaults;

    // Enable notifications after initial setup
    shouldNotifyRef.current = true;
  }, [variables, reset, prevVariables]);

  if (variables.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Variable className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No variables detected</p>
        <p className="text-xs">
          Use {"{{ variable_name }}"} syntax to add variables
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={`space-y-4 ${className}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {variables.map((variable) => (
          <div key={variable.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={variable.name} className="text-sm">
                {variable.name}
                {variable.isRequired && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
              {variable.type && (
                <Badge variant="outline" className="text-xs">
                  {variable.type}
                </Badge>
              )}
            </div>

            {variable.description && (
              <p className="text-xs text-muted-foreground">
                {variable.description}
              </p>
            )}

            {variable.type === "boolean" ? (
              <div className="flex items-center space-x-2">
                <Controller
                  name={variable.name}
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id={variable.name}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor={variable.name} className="text-sm">
                  {formValues[variable.name] ? "True" : "False"}
                </Label>
              </div>
            ) : variable.type === "text" ||
              (variable.maxLength && variable.maxLength > 100) ? (
              <Textarea
                id={variable.name}
                {...register(variable.name)}
                placeholder={`Enter value for ${variable.name}`}
                className="w-full"
              />
            ) : (
              <Input
                id={variable.name}
                type={variable.type === "number" ? "number" : "text"}
                {...register(variable.name)}
                placeholder={`Enter value for ${variable.name}`}
                className={`w-full ${
                  errors[variable.name]
                    ? "border-red-400 focus:ring-red-400"
                    : ""
                }`}
              />
            )}

            {errors[variable.name] && (
              <p className="text-xs text-red-500 mt-1">
                {String(errors[variable.name]?.message)}
              </p>
            )}
          </div>
        ))}
      </div>

      {onSubmit && (
        <Button type="submit" className="mt-4">
          Apply Variables
        </Button>
      )}
    </form>
  );
}
