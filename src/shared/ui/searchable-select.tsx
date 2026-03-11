"use client";

import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

type SearchableSelectSelectionState<T> = {
  selectedOption: T | null;
  selectedOptions: T[];
  selectedValues: string[];
};

type SearchableSelectBaseProps<T> = {
  id?: string;
  options: T[];
  getOptionValue: (option: T) => string;
  getOptionLabel: (option: T) => string;
  getOptionDescription?: (option: T) => string | null | undefined;
  filterOption?: (option: T, normalizedKeyword: string) => boolean;
  renderTrigger?: (
    selection: SearchableSelectSelectionState<T>,
  ) => React.ReactNode;
  renderSelectionSummary?: (
    selection: SearchableSelectSelectionState<T> & {
      removeValue: (value: string) => void;
    },
  ) => React.ReactNode;
  renderOption?: (
    option: T,
    context: {
      selected: boolean;
      multiple: boolean;
    },
  ) => React.ReactNode;
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  disabled?: boolean;
  closeOnSelect?: boolean;
  triggerClassName?: string;
  contentClassName?: string;
};

type SearchableSelectSingleProps<T> = SearchableSelectBaseProps<T> & {
  multiple?: false;
  value: string;
  onValueChange: (value: string) => void;
};

type SearchableSelectMultiProps<T> = SearchableSelectBaseProps<T> & {
  multiple: true;
  values: string[];
  onValuesChange: (values: string[]) => void;
};

type SearchableSelectProps<T> =
  | SearchableSelectSingleProps<T>
  | SearchableSelectMultiProps<T>;

export function SearchableSelect<T>(props: SearchableSelectProps<T>) {
  const {
    id,
    options,
    getOptionValue,
    getOptionLabel,
    getOptionDescription,
    filterOption,
    renderTrigger,
    renderSelectionSummary,
    renderOption,
    placeholder,
    searchPlaceholder,
    emptyLabel,
    disabled,
    closeOnSelect,
    triggerClassName,
    contentClassName,
  } = props;
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  const multiple = props.multiple === true;
  const singleValue = multiple ? null : props.value;
  const multiValues = multiple ? props.values : null;
  const selectedValues = useMemo(
    () => (multiValues ? multiValues : singleValue ? [singleValue] : []),
    [multiValues, singleValue],
  );
  const selectedOptions = useMemo(
    () =>
      selectedValues
        .map((selectedValue) =>
          options.find((option) => getOptionValue(option) === selectedValue),
        )
        .filter((option): option is T => option != null),
    [getOptionValue, options, selectedValues],
  );
  const selectedOption = selectedOptions[0] || null;
  const selectionState = useMemo(
    () => ({
      selectedOption,
      selectedOptions,
      selectedValues,
    }),
    [selectedOption, selectedOptions, selectedValues],
  );
  const filteredOptions = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) {
      return options;
    }

    if (filterOption) {
      return options.filter((option) => filterOption(option, normalizedKeyword));
    }

    return options.filter((option) => {
      const label = getOptionLabel(option).toLowerCase();
      const description = (getOptionDescription?.(option) || "").toLowerCase();
      return (
        label.includes(normalizedKeyword) ||
        description.includes(normalizedKeyword)
      );
    });
  }, [
    filterOption,
    getOptionDescription,
    getOptionLabel,
    keyword,
    options,
  ]);

  const closeAfterSelect = closeOnSelect ?? !multiple;

  const updateSelection = (nextValue: string) => {
    if (multiple) {
      const nextValues = selectedValues.includes(nextValue)
        ? selectedValues.filter((value) => value !== nextValue)
        : [...selectedValues, nextValue];

      props.onValuesChange(nextValues);
    } else {
      props.onValueChange(nextValue);
    }

    if (closeAfterSelect) {
      setOpen(false);
      setKeyword("");
    }
  };

  const removeValue = (valueToRemove: string) => {
    if (!multiple) {
      return;
    }

    props.onValuesChange(
      selectedValues.filter((value) => value !== valueToRemove),
    );
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setKeyword("");
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          id={id}
          disabled={disabled}
          className={cn(
            "text-foreground h-auto min-h-8 w-full justify-between",
            triggerClassName,
          )}
        >
          {renderTrigger ? (
            renderTrigger(selectionState)
          ) : (
            <span
              className={cn(
                "text-foreground truncate text-left text-sm font-normal",
                !selectedOption && "text-muted-foreground",
              )}
            >
              {selectedOption ? getOptionLabel(selectedOption) : placeholder}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn(
          "w-[360px] rounded-xl p-2 [zoom:var(--app-scale)]",
          contentClassName,
        )}
      >
        <div className="relative mb-2">
          <HugeiconsIcon
            icon={Search01Icon}
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
          />
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={searchPlaceholder}
            className="pl-8"
          />
        </div>

        {renderSelectionSummary
          ? renderSelectionSummary({
              ...selectionState,
              removeValue,
            })
          : null}

        <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
          {filteredOptions.length === 0 ? (
            <div className="text-muted-foreground rounded-lg border border-dashed px-3 py-6 text-center text-sm">
              {emptyLabel}
            </div>
          ) : (
            filteredOptions.map((option) => {
              const optionValue = getOptionValue(option);
              const selected = selectedValues.includes(optionValue);

              return (
                <button
                  key={optionValue}
                  type="button"
                  onClick={() => updateSelection(optionValue)}
                  className={cn(
                    "hover:bg-muted/60 flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition",
                    selected
                      ? "border-primary/40 bg-primary/[0.06]"
                      : "border-transparent",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    {renderOption ? (
                      renderOption(option, { selected, multiple })
                    ) : (
                      <>
                        <p className="truncate text-sm font-medium">
                          {getOptionLabel(option)}
                        </p>
                        {getOptionDescription?.(option) ? (
                          <p className="text-muted-foreground truncate text-xs">
                            {getOptionDescription(option)}
                          </p>
                        ) : null}
                      </>
                    )}
                  </div>
                  {selected ? (
                    <HugeiconsIcon
                      icon={Tick02Icon}
                      className="text-primary size-4 shrink-0"
                    />
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
