import type { ComponentType } from "react";
import { Button } from "./button";

/** 미리보기에서 값을 바꿔볼 수 있는 prop 하나의 정의. */
export type GalleryControl =
  | { name: string; type: "select"; options: string[] }
  | { name: string; type: "boolean" }
  | { name: string; type: "text" };

export type GalleryEntry = {
  id: string;
  label: string;
  // 갤러리 컴포넌트마다 prop 모양이 달라 여기서는 느슨하게 받는다.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: ComponentType<any>;
  defaultProps: Record<string, unknown>;
  controls: GalleryControl[];
  /** 노트에 함께 보여줄 실제 소스 파일. 아래 raw 글롭의 키와 같아야 한다. */
  sourceFiles: string[];
};

/**
 * 갤러리 소스를 파일에서 그대로 읽어온다.
 * 미리보기와 노트에 실리는 코드가 같은 파일 하나에서 나오므로 둘이 갈라질 수 없다.
 */
const RAW_SOURCES = import.meta.glob("./*.{tsx,css}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export function getGallerySource(file: string): string {
  return RAW_SOURCES[`./${file}`] ?? "";
}

export const GALLERY_ENTRIES: GalleryEntry[] = [
  {
    id: "button",
    label: "Button",
    Component: Button,
    defaultProps: { variant: "primary", size: "md", loading: false, children: "저장" },
    controls: [
      { name: "variant", type: "select", options: ["primary", "secondary", "ghost", "danger"] },
      { name: "size", type: "select", options: ["sm", "md", "lg"] },
      { name: "loading", type: "boolean" },
      { name: "disabled", type: "boolean" },
      { name: "children", type: "text" },
    ],
    sourceFiles: ["button.tsx", "button.css"],
  },
];

export function findGalleryEntry(id: string): GalleryEntry | undefined {
  return GALLERY_ENTRIES.find((entry) => entry.id === id);
}
