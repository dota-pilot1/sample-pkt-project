"use client";

interface SelectOption {
  value: string;
  label?: string;
}

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

/** 라벨·select·옵션 접근성을 공통화해 폼마다 반복되는 선택 입력을 줄인다. */
export default function SelectField({ id, label, value, options, onChange }: SelectFieldProps) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div className="select-field-control">
        <select id={id} name={id} value={value} onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => <option key={option.value} value={option.value}>{option.label ?? option.value}</option>)}
        </select>
        <span className="select-field-chevron" aria-hidden="true" />
      </div>
    </div>
  );
}
