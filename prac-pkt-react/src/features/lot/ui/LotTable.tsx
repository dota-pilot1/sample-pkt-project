import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import type { Lot, LotSort, LotSortField, SortDirection } from "../model/lot.types";
import { LotTableRow } from "./LotTableRow";

/** 컬럼마다 처음 눌렀을 때 자연스러운 방향이 다르다. 날짜는 최신순, 나머지는 오름차순으로 시작한다. */
const columns: { field: LotSortField; label: string; initialDirection: SortDirection }[] = [
  { field: "lotCode", label: "LOT ID", initialDirection: "asc" },
  { field: "productName", label: "제품", initialDirection: "asc" },
  { field: "status", label: "상태", initialDirection: "asc" },
  { field: "process", label: "공정", initialDirection: "asc" },
  { field: "updatedAt", label: "수정일", initialDirection: "desc" },
];

type LotTableProps = {
  rows: Lot[];
  selectedLotId?: string;
  onSelect?: (lot: Lot) => void;
  sort?: LotSort;
  onSortChange?: (sort: LotSort) => void;
};

export function LotTable({ rows, selectedLotId, onSelect, sort, onSortChange }: LotTableProps) {
  const ariaSort = (field: LotSortField) => {
    if (sort?.field !== field) return "none" as const;
    return sort.direction === "asc" ? ("ascending" as const) : ("descending" as const);
  };

  const toggle = (field: LotSortField, initialDirection: SortDirection) =>
    onSortChange?.({
      field,
      direction: sort?.field === field ? (sort.direction === "asc" ? "desc" : "asc") : initialDirection,
    });

  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-slate-50 text-xs font-black text-slate-500">
        <tr>
          {columns.map(({ field, label, initialDirection }) => {
            const active = sort?.field === field;
            const Icon = !active ? ChevronsUpDown : sort.direction === "asc" ? ChevronUp : ChevronDown;
            return (
              <th key={field} scope="col" aria-sort={onSortChange ? ariaSort(field) : undefined} className="px-5 py-3">
                {onSortChange ? (
                  <button
                    type="button"
                    onClick={() => toggle(field, initialDirection)}
                    className={`group flex items-center gap-1 rounded transition focus:outline-none focus:ring-2 focus:ring-sky-300 ${active ? "text-sky-700" : "hover:text-slate-900"}`}
                  >
                    {label}
                    <Icon className={`size-3.5 transition ${active ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`} />
                  </button>
                ) : label}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={columns.length} className="px-5 py-10 text-center text-sm font-semibold text-slate-500">표시할 LOT가 없습니다.</td></tr>
        ) : rows.map((lot) => <LotTableRow key={lot.id} lot={lot} selected={lot.id === selectedLotId} onSelect={onSelect} />)}
      </tbody>
    </table>
  );
}
