import { useMemo, useState } from 'react'
import { findGalleryEntry, getGallerySource, type GalleryControl } from '../gallery/registry'

export type ComponentPreviewBlock = {
  componentId: string
  props: Record<string, unknown>
}

function ControlField({
  control,
  value,
  onChange,
}: {
  control: GalleryControl
  value: unknown
  onChange: (next: unknown) => void
}) {
  const label = <span className="text-[11px] font-black text-text-muted">{control.name}</span>

  if (control.type === 'select') {
    return (
      <label className="flex items-center gap-1.5">
        {label}
        <select
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value)}
          className="rounded-md border border-surface-border bg-surface-raised px-1.5 py-1 text-[11px] font-bold text-text-primary"
        >
          {control.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    )
  }

  if (control.type === 'boolean') {
    return (
      <label className="flex items-center gap-1.5">
        {label}
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />
      </label>
    )
  }

  return (
    <label className="flex items-center gap-1.5">
      {label}
      <input
        value={String(value ?? '')}
        onChange={(event) => onChange(event.target.value)}
        className="w-28 rounded-md border border-surface-border bg-surface-raised px-1.5 py-1 text-[11px] font-bold text-text-primary"
      />
    </label>
  )
}

/**
 * 레지스트리에 등록된 실제 컴포넌트를 그대로 렌더한다.
 * 코드 문자열을 컴파일하지 않으므로 임의 코드가 실행될 일이 없다.
 */
export function ComponentPreview({ block, framed = true }: { block: ComponentPreviewBlock; framed?: boolean }) {
  const entry = findGalleryEntry(block.componentId)
  const [props, setProps] = useState<Record<string, unknown>>(() => ({
    ...(entry?.defaultProps ?? {}),
    ...block.props,
  }))
  const [showSource, setShowSource] = useState(false)

  const sources = useMemo(
    () => (entry?.sourceFiles ?? []).map((file) => ({ file, code: getGallerySource(file) })),
    [entry],
  )

  if (!entry) {
    return (
      <div className="rounded-md border border-dashed border-surface-border bg-surface-muted px-4 py-6 text-center text-[12px] font-bold text-text-muted">
        갤러리에 없는 컴포넌트입니다: <code>{block.componentId}</code>
      </div>
    )
  }

  const { Component } = entry

  return (
    <div className={framed ? "overflow-hidden rounded-lg border border-surface-border-soft bg-surface-raised" : "bg-surface-raised"}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-surface-border-soft px-3 py-2">
        <span className="text-[12px] font-black text-text-primary">{entry.label}</span>
        {entry.controls.map((control) => (
          <ControlField
            key={control.name}
            control={control}
            value={props[control.name]}
            onChange={(next) => setProps((current) => ({ ...current, [control.name]: next }))}
          />
        ))}
        <button
          type="button"
          onClick={() => setShowSource((current) => !current)}
          className="ml-auto text-[11px] font-black text-brand-primary hover:underline"
        >
          {showSource ? '소스 숨기기' : '소스 보기'}
        </button>
      </div>

      <div className="grid min-h-[120px] place-items-center bg-surface-muted p-6">
        <Component {...props} />
      </div>

      {showSource &&
        sources.map((source) => (
          <div key={source.file} className="border-t border-surface-border-soft">
            <div className="bg-surface-raised px-3 py-1.5 font-mono text-[10.5px] font-black text-text-muted">
              {source.file}
            </div>
            <pre className="overflow-x-auto bg-surface-muted px-3 py-2 font-mono text-[11px] leading-5 text-text-primary">
              {source.code}
            </pre>
          </div>
        ))}
    </div>
  )
}
