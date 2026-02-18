"use client";

import { Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { CategoryNode } from "@/lib/types/shop";

interface CategoryFilterProps {
  categories: CategoryNode[];
  selectedCategories: string[]; // Now stores slugs
  onToggle: (categorySlug: string) => void;
}

function CategoryNodeItem({
  node,
  selectedCategories,
  onToggle,
}: {
  node: CategoryNode;
  selectedCategories: string[];
  onToggle: (categorySlug: string) => void;
}) {
  const isSelected = selectedCategories.includes(node.slug);
  const hasChildren = node.children.length > 0;
  
  // Count selected children
  const selectedChildrenCount = node.children.filter(child => 
    selectedCategories.includes(child.slug)
  ).length;

  if (!hasChildren) {
    return (
      <div className="flex items-center gap-2 py-1.5">
        <Checkbox
          id={node.slug}
          checked={isSelected}
          onCheckedChange={() => onToggle(node.slug)}
          className="border-slate-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
        />
        <Label
          htmlFor={node.slug}
          className="flex-1 text-sm cursor-pointer hover:text-slate-700 transition-colors"
        >
          <span className="font-medium">{node.name}</span>
          <span className="text-slate-400 ml-1.5">({node.productCount})</span>
        </Label>
      </div>
    );
  }

  return (
    <AccordionItem value={node.slug} className="border-none">
      <div className="flex items-center gap-2 py-1.5">
        <Checkbox
          id={node.slug}
          checked={isSelected}
          onCheckedChange={() => onToggle(node.slug)}
          className="border-slate-300 data-[state=checked]:bg-black data-[state=checked]:border-black shrink-0"
        />
        <AccordionTrigger className="py-0 hover:no-underline flex-1 justify-start gap-2 [&[data-state=open]>svg]:rotate-180">
          <span className="font-medium text-sm">{node.name}</span>
          <span className="text-slate-400 text-sm">({node.productCount})</span>
          {selectedChildrenCount > 0 && (
            <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
          )}
        </AccordionTrigger>
      </div>
      <AccordionContent>
        <div className="pl-6 space-y-0.5 border-l-2 border-slate-100 ml-2">
          {node.children.map((child) => (
            <CategoryNodeItem
              key={child.slug}
              node={child}
              selectedCategories={selectedCategories}
              onToggle={onToggle}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function CategoryFilter({
  categories,
  selectedCategories,
  onToggle,
}: CategoryFilterProps) {
  // Default expanded: first level categories (using slugs)
  const defaultExpanded = categories.map(cat => cat.slug);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Categories</h3>
      </div>

      <Accordion type="multiple" defaultValue={defaultExpanded} className="space-y-1">
        {categories.map((category) => (
          <CategoryNodeItem
            key={category.slug}
            node={category}
            selectedCategories={selectedCategories}
            onToggle={onToggle}
          />
        ))}
      </Accordion>
    </div>
  );
}
