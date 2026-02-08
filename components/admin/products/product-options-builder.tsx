"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ProductOptionData {
  id?: string;
  name: string;
  values: Array<{
    id?: string;
    value: string;
  }>;
}

interface ProductOptionsBuilderProps {
  options: ProductOptionData[];
  onChange: (options: ProductOptionData[]) => void;
}

export function ProductOptionsBuilder({
  options,
  onChange,
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
                  />
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
                    <div key={valueIndex} className="flex items-center gap-2">
                      <Input
                        value={value.value}
                        onChange={(e) =>
                          updateValue(optionIndex, valueIndex, e.target.value)
                        }
                        placeholder={`Value ${valueIndex + 1} (e.g., M, L, XL)`}
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
