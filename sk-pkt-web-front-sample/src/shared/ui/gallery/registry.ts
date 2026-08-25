import type { ComponentType } from "react";

export type GalleryControl =
  | { name: string; type: "select"; options: string[] }
  | { name: string; type: "boolean" }
  | { name: string; type: "text" }
  | { name: string; type: "number"; min?: number; max?: number };

export type GalleryEntry = {
  id: string;
  label: string;
  Component: ComponentType<Record<string, unknown>>;
  defaultProps: Record<string, unknown>;
  controls: GalleryControl[];
  sourceFiles: string[];
};

// The MES app does not yet expose the Tauri component gallery. Keep the
// editor's component-preview contract available so existing Lexical content
// remains readable and the gallery can be registered later without changing
// the editor schema.
export const GALLERY_ENTRIES: GalleryEntry[] = [];

export function findGalleryEntry(id: string): GalleryEntry | undefined {
  return GALLERY_ENTRIES.find((entry) => entry.id === id);
}

export function getGallerySource(_file: string): string {
  return "";
}
