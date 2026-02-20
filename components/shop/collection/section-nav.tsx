"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { CollectionSection } from "@/lib/types/collections";

interface SectionNavProps {
  sections: CollectionSection[];
}

export function SectionNav({ sections }: SectionNavProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach((section) => {
      const element = document.getElementById(`section-${section.slug}`);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(section.slug);
            }
          });
        },
        {
          rootMargin: "-20% 0px -60% 0px",
          threshold: 0,
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [sections]);

  const scrollToSection = (slug: string) => {
    const element = document.getElementById(`section-${slug}`);
    if (element) {
      const offset = 100; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  if (sections.length === 0) return null;

  return (
    <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <nav className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.slug)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                activeSection === section.slug
                  ? "bg-black text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              )}
            >
              {section.name}
              <span className="ml-1.5 text-xs opacity-70">
                ({section.productCount})
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
