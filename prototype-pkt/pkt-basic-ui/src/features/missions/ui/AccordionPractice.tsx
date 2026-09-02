"use client";

import { ChevronDown, ClipboardCheck, Factory, History } from "lucide-react";
import { useState } from "react";

const accordionItems = [
  {
    title: "LOT 기본 정보",
    description: "LOT 번호, 제품명, 현재 공정을 요약해서 보여줍니다.",
    meta: "LOT-2026-0902-001 · PKT Housing A",
    icon: Factory,
    accent: "from-sky-500 to-cyan-400",
    surface: "border-sky-200 bg-sky-50/70 dark:border-sky-900/70 dark:bg-sky-950/30",
  },
  {
    title: "검사 결과",
    description: "최근 검사 결과와 보류 사유를 펼쳐서 확인합니다.",
    meta: "치수 검사 통과 · 2026.09.02 14:20",
    icon: ClipboardCheck,
    accent: "from-violet-500 to-fuchsia-400",
    surface: "border-violet-200 bg-violet-50/70 dark:border-violet-900/70 dark:bg-violet-950/30",
  },
  {
    title: "처리 이력",
    description: "담당자와 처리 시각을 시간순으로 확인합니다.",
    meta: "최종 처리 · 김현우 · 5분 전",
    icon: History,
    accent: "from-amber-500 to-orange-400",
    surface: "border-amber-200 bg-amber-50/70 dark:border-amber-900/70 dark:bg-amber-950/30",
  },
];

export function AccordionPractice() {
  // 한 번에 한 패널만 열어 LOT 상세 정보의 시선을 분산시키지 않는다.
  const [openIndex, setOpenIndex] = useState(0);

  // 같은 헤더를 다시 누르면 닫고, 다른 헤더를 누르면 해당 패널로 전환한다.
  const handleAccordionClick = (index: number) => {
    setOpenIndex((currentIndex) => (currentIndex === index ? -1 : index));
  };

  return (
    <section className="mt-10" aria-labelledby="accordion-preview-title">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-primary">INTERACTION PREVIEW</p>
          <h2 id="accordion-preview-title" className="mt-2 text-xl font-bold">LOT 상세 아코디언</h2>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">클릭해서 열기</span>
      </div>
      <div className="space-y-3 rounded-2xl border border-border bg-gradient-to-br from-background to-muted/50 p-3 shadow-sm">
        {accordionItems.map((item, index) => {
          const isOpen = openIndex === index;
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className={`overflow-hidden rounded-xl border transition-all duration-200 ${item.surface} ${isOpen ? "shadow-md" : "hover:-translate-y-0.5 hover:shadow-sm"}`}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`accordion-panel-${index}`}
                className="flex w-full items-center gap-4 px-4 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                onClick={() => handleAccordionClick(index)}
              >
                <span className={`grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm ${item.accent}`}>
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{item.title}</span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">{item.meta}</span>
                </span>
                <ChevronDown
                  className={`size-5 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
              <div
                id={`accordion-panel-${index}`}
                hidden={!isOpen}
                className="border-t border-black/5 px-4 pb-4 pt-3 text-sm leading-6 text-muted-foreground dark:border-white/10"
              >
                {item.description}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
