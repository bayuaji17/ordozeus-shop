"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { searchDestinations } from "@/lib/actions/rajaongkir";

interface LocationOption {
  id: number;
  label: string;
  province: string;
  city: string;
  district: string;
  subdistrict: string;
  zipCode: string;
}

interface LocationSelectorProps {
  value?: LocationOption | null;
  onChange: (location: LocationOption | null) => void;
  disabled?: boolean;
}

export function LocationSelector({
  value,
  onChange,
  disabled = false,
}: LocationSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [options, setOptions] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  const handleSearch = useCallback(async (query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 2) {
      setOptions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchDestinations(query, 10);
        setOptions(results);
      } catch (error) {
        console.error("Error searching destinations:", error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce
  }, []);

  // Update search when input changes
  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, handleSearch]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleSelect = (location: LocationOption) => {
    onChange(location);
    setOpen(false);
    setSearchQuery("");
    setOptions([]);
  };

  const displayValue = value
    ? `${value.subdistrict}, ${value.district}, ${value.city}, ${value.province}, ${value.zipCode}`
    : "Search location...";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between h-11 px-3 py-2",
            !value && "text-muted-foreground",
          )}
        >
          <span className="truncate">{displayValue}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-100 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type kecamatan or kelurahan name..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-11"
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Searching...
                </span>
              </div>
            )}

            {!loading && searchQuery.length < 2 && (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                Type at least 2 characters to search
              </div>
            )}

            {!loading && searchQuery.length >= 2 && options.length === 0 && (
              <CommandEmpty>No location found.</CommandEmpty>
            )}

            {!loading && options.length > 0 && (
              <CommandGroup heading="Select a location">
                {options.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.label}
                    onSelect={() => handleSelect(option)}
                    className="flex flex-col items-start py-3 px-4 cursor-pointer"
                  >
                    <div className="flex items-center w-full">
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 shrink-0",
                          value?.id === option.id ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {option.subdistrict}, {option.district}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {option.city}, {option.province} - {option.zipCode}
                        </p>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Display component for showing selected location details
interface LocationDetailsProps {
  location: LocationOption | null;
}

export function LocationDetails({ location }: LocationDetailsProps) {
  if (!location) {
    return (
      <div className="text-sm text-muted-foreground italic">
        Select a location to see details
      </div>
    );
  }

  return (
    <div className="space-y-2 text-sm">
      <div className="grid grid-cols-[100px_1fr] gap-2">
        <span className="text-muted-foreground">Province:</span>
        <span className="font-medium">{location.province}</span>
      </div>
      <div className="grid grid-cols-[100px_1fr] gap-2">
        <span className="text-muted-foreground">City:</span>
        <span className="font-medium">{location.city}</span>
      </div>
      <div className="grid grid-cols-[100px_1fr] gap-2">
        <span className="text-muted-foreground">District:</span>
        <span className="font-medium">{location.district}</span>
      </div>
      <div className="grid grid-cols-[100px_1fr] gap-2">
        <span className="text-muted-foreground">Subdistrict:</span>
        <span className="font-medium">{location.subdistrict}</span>
      </div>
      <div className="grid grid-cols-[100px_1fr] gap-2">
        <span className="text-muted-foreground">Postal Code:</span>
        <span className="font-medium">{location.zipCode}</span>
      </div>
    </div>
  );
}
