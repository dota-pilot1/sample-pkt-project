"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

type SearchInputProps = {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  showEnterHint?: boolean;
  submitOnEnter?: boolean;
};

/** 목록 검색에 쓰는 입력칸이다. form 안에서 쓰면 Enter로 제출할 수 있다. */
export function SearchInput({
  label,
  value,
  placeholder,
  onChange,
  showEnterHint = false,
  submitOnEnter = false,
}: Readonly<SearchInputProps>) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  function commit() {
    if (draft !== value) onChange(draft);
  }

  return (
    <label className="search-input">
      <span className="search-input-icon"><Search aria-hidden="true" size={17} /></span>
      <span className="sr-only">{label}</span>
      <input
        value={draft}
        onChange={(event) => {
          const nextValue = event.target.value;
          setDraft(nextValue);
          if (!submitOnEnter) onChange(nextValue);
        }}
        onKeyDown={(event) => {
          if (!submitOnEnter || event.key !== "Enter") return;
          // Drawer 내부 form의 저장 제출보다 검색 확정을 우선한다.
          event.preventDefault();
          commit();
        }}
        placeholder={placeholder}
      />
      {showEnterHint && <kbd className="search-input-hint" aria-hidden="true">↵ Enter</kbd>}
    </label>
  );
}
