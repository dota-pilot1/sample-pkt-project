import { ChevronDown } from "lucide-react";
import { forwardRef, type SelectHTMLAttributes } from "react";

export type SelectOption = {
  value: string | number;
  label: string;
  disabled?: boolean;
};

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  options: SelectOption[];
};

/** 목록 필터와 표시 단위에서 공통으로 쓰는 접근 가능한 native Select 래퍼다. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, className = "", ...props },
  ref,
) {
  return (
    <span className="relative inline-flex min-w-0">
      <select
        ref={ref}
        {...props}
        className={`h-10 w-full appearance-none rounded-md border border-input bg-background py-2 pl-3 pr-9 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </span>
  );
});
