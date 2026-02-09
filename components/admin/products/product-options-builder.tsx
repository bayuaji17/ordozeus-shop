"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FieldError } from "@/components/ui/field";
import type { ProductOptionInput } from "@/lib/types";

interface ProductOptionsBuilderProps {
  options: ProductOptionInput[];
  onChange: (options: ProductOptionInput[]) => void;
  errors?: Record<number, Record<string, { message?: string } | Record<number, Record<string, { message?: string }>>>>;
}

export function ProductOptionsBuilder({
  options,
  onChange,
  errors,
}: ProductOptionsBuilderProps) {
  const addOption = () => {
    onChange([
      ...options,
      {
        name: "",
        values: [{ value: "" }, { value: "" }],
      },
    ]);
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  const updateOptionName = (index: number, name: string) => {
    const updated = [...options];
    updated[index] = { ...updated[index], name };
    onChange(updated);
  };

  const addValue = (optionIndex: number) => {
    const updated = [...options];
    updated[optionIndex] = {
      ...updated[optionIndex],
      values: [...updated[optionIndex].values, { value: "" }],
    };
    onChange(updated);
  };

  const removeValue = (optionIndex: number, valueIndex: number) => {
    const updated = [...options];
    updated[optionIndex] = {
      ...updated[optionIndex],
      values: updated[optionIndex].values.filter((_, i) => i !== valueIndex),
    };
    onChange(updated);
  };

  const updateValue = (optionIndex: number, valueIndex: number, value: string) => {
    const updated = [...options];
    updated[optionIndex].values[valueIndex] = {
      ...updated[optionIndex].values[valueIndex],
      value,
    };
    onChange(updated);
  };

  // Type-safe error access helpers
  const getOptionError = (optionIndex: number, field: string) => {
    const optionErrors = errors?.[optionIndex];
    if (!optionErrors) return undefined;
    const fieldError = optionErrors[field];
    if (fieldError && typeof fieldError === 'object' && 'message' in fieldError) {
      return fieldError as { message?: string };
    }
    return undefined;
  };

  const getValueError = (optionIndex: number, valueIndex: number, field: string) => {
    const optionErrors = errors?.[optionIndex];
    if (!optionErrors) return undefined;
    const valuesErrors = optionErrors['values'];
    if (!valuesErrors || typeof valuesErrors !== 'object') return undefined;
    const valueErrors = (valuesErrors as Record<number, Record<string, { message?: string }>>)?.[valueIndex];
    if (!valueErrors) return undefined;
    return valueErrors[field];
  };

  const getValuesArrayError = (optionIndex: number) => {
    const optionErrors = errors?.[optionIndex];
    if (!optionErrors) return undefined;
    const valuesErrors = optionErrors['values'];
    if (valuesErrors && typeof valuesErrors === 'object' && 'message' in valuesErrors) {
      return valuesErrors as { message?: string };
    }
    return undefined;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Product Options</span>
          <Button type="button" variant="outline" size="sm" onClick={addOption}>
            <Plus className="h-4 w-4 mr-1" />
            Add Option
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {options.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              No options added yet. Options define variants like Size, Color, etc.
            </p>
            <Button type="button" variant="outline" onClick={addOption}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Option
            </Button>
          </div>
        ) : (
          options.map((option, optionIndex) => (
            <div
              key={optionIndex}
              className="space-y-4 p-4 border rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label htmlFor={`option-name-${optionIndex}`}>
                    Option Name (e.g., Size, Color)
                  </Label>
                  <Input
                    id={`option-name-${optionIndex}`}
                    value={option.name}
                    onChange={(e) => updateOptionName(optionIndex, e.target.value)}
                    placeholder="e.g., Size"
                    className={getOptionError(optionIndex, 'name') ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {getOptionError(optionIndex, 'name') && (
                    <FieldError errors={[getOptionError(optionIndex, 'name')!]} />
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(optionIndex)}
                  className="mt-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <Label className="mb-2 block">
                  Values (at least 2 required)
                </Label>
                <div className="space-y-2">
                  {option.values.map((value, valueIndex) => (
                    <div key={valueIndex} className="flex-1">
                      <div className="flex items-center gap-2">
                        <Input
                          value={value.value}
                          onChange={(e) =>
                            updateValue(optionIndex, valueIndex, e.target.value)
                          }
                          placeholder={`Value ${valueIndex + 1} (e.g., M, L, XL)`}
                          className={getValueError(optionIndex, valueIndex, 'value') ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {option.values.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeValue(optionIndex, valueIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {getValueError(optionIndex, valueIndex, 'value') && (
                        <FieldError errors={[getValueError(optionIndex, valueIndex, 'value')!]} />
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addValue(optionIndex)}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Value
                </Button>
                {getValuesArrayError(optionIndex) && (
                  <FieldError errors={[getValuesArrayError(optionIndex)!]} />
                )}
              </div>

              {/* Preview of values */}
              {option.values.filter((v) => v.value.trim()).length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                  <div className="flex flex-wrap gap-1">
                    {option.values
                      .filter((v) => v.value.trim())
                      .map((value, idx) => (
                        <Badge key={idx} variant="secondary">
                          {value.value}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// Re-export type for backwards compatibility
export type { ProductOptionInput as ProductOptionData };
