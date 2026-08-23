import type { KeyboardEvent } from "react";
import type { Lot } from "../model/lot.types";

type LotTableRowProps = { lot: Lot; selected?: boolean; onSelect?: (lot: Lot) => void };

export function LotTableRow({ lot, selected = false, onSelect }: LotTableRowProps) {
  const handleSelect = () => onSelect?.(lot);
  const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect();
    }
  };

  return (
    <tr tabIndex={0} aria-selected={selected} role={onSelect ? "button" : undefined} onClick={handleSelect} onKeyDown={handleKeyDown} className={`cursor-pointer border-t border-slate-100 transition-colors hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-300 ${selected ? "bg-sky-50" : ""}`}>
      <td className="px-5 py-4 font-black"><span className={`mr-2 inline-block size-2 rounded-full align-middle ${selected ? "bg-sky-600" : "bg-transparent"}`} aria-hidden="true" />{lot.id}</td>
      <td className="px-5 py-4 font-semibold">{lot.product}</td>
      <td className="px-5 py-4"><span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-black text-sky-700">{lot.status}</span></td>
      <td className="px-5 py-4 text-slate-600">{lot.process}</td><td className="px-5 py-4 text-slate-500">{lot.updatedAt}</td>
    </tr>
  );
}
