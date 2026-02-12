import { useState, useRef, useEffect } from "react";

type CountrySelectProps = {
  value?: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; divider?: boolean }[];
  iconComponent: React.ComponentType<{ country: string; label: string }>;
  disabled?: boolean;
  className?: string;
  name?: string;
  "aria-label"?: string;
};

const CountrySelect = ({
  value,
  onChange,
  options,
  iconComponent: Icon,
  disabled,
}: CountrySelectProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll to selected item when opened
  useEffect(() => {
    if (open && listRef.current && value) {
      const el = listRef.current.querySelector(`[data-value="${value}"]`) as HTMLElement;
      if (el) el.scrollIntoView({ block: "center" });
    }
  }, [open, value]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 cursor-pointer bg-transparent border-none outline-none"
      >
        {value && <Icon country={value} label={selected?.label || ""} />}
        <span className="PhoneInputCountrySelectArrow" />
      </button>

      {open && (
        <div
          ref={listRef}
          className="absolute top-full left-0 mt-1 z-[9999] bg-foreground/95 backdrop-blur-sm border border-background/20 rounded-lg shadow-2xl overflow-y-auto"
          style={{ maxHeight: "280px", width: "200px" }}
        >
          {options
            .filter((o) => !o.divider && o.value)
            .map((option) => (
              <button
                key={option.value}
                type="button"
                data-value={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 text-xs text-background hover:bg-background/15 transition-colors ${
                  option.value === value ? "bg-background/10 font-medium" : ""
                }`}
              >
                <Icon country={option.value} label={option.label} />
                <span className="truncate">{option.label}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default CountrySelect;
