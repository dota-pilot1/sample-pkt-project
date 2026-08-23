import type { Lot } from "../model/lot.types";
import { LotTableRow } from "./LotTableRow";

type LotTableProps = { rows: Lot[]; selectedLotId?: string; onSelect?: (lot: Lot) => void };

export function LotTable({ rows, selectedLotId, onSelect }: LotTableProps) {
  if (rows.length === 0) return <p className="p-5 text-sm font-semibold text-slate-500">표시할 LOT가 없습니다.</p>;

  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-slate-50 text-xs font-black text-slate-500"><tr>
        <th scope="col" className="px-5 py-3">LOT ID</th><th scope="col" className="px-5 py-3">제품</th><th scope="col" className="px-5 py-3">상태</th><th scope="col" className="px-5 py-3">공정</th><th scope="col" className="px-5 py-3">수정일</th>
      </tr></thead>
      <tbody>{rows.map((lot) => <LotTableRow key={lot.id} lot={lot} selected={lot.id === selectedLotId} onSelect={onSelect} />)}</tbody>
    </table>
  );
}
