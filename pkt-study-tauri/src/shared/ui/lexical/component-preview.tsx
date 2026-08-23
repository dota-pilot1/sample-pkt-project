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
  const label = <span className="text-[12.5px] font-black text-text-muted">{control.name}</span>

  if (control.type === 'select') {
    return (
      <label className="flex items-center gap-1.5">
        {label}
        <select
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value)}
          className="rounded-md border border-surface-border bg-surface-raised px-2 py-1.5 text-[12.5px] font-bold text-text-primary"
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

  if (control.type === 'number') {
    return (
      <label className="flex items-center gap-1.5">
        {label}
        <input
          type="number"
          min={control.min}
          max={control.max}
          value={Number(value ?? 0)}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-20 rounded-md border border-surface-border bg-surface-raised px-2 py-1.5 text-[12.5px] font-bold text-text-primary"
        />
      </label>
    )
  }

  if (control.type === 'boolean') {
    return (
      <label className="flex items-center gap-1.5">
        {label}
        <input type="checkbox" className="size-4" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />
      </label>
    )
  }

  return (
    <label className="flex items-center gap-1.5">
      {label}
      <input
        value={String(value ?? '')}
        onChange={(event) => onChange(event.target.value)}
        className="w-36 rounded-md border border-surface-border bg-surface-raised px-2 py-1.5 text-[12.5px] font-bold text-text-primary"
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
      <div className="rounded-md border border-dashed border-surface-border bg-surface-muted px-4 py-6 text-center text-[13px] font-bold text-text-muted">
        갤러리에 없는 컴포넌트입니다: <code>{block.componentId}</code>
      </div>
    )
  }

  const { Component } = entry

  return (
    <div className={framed ? "overflow-hidden rounded-lg border border-surface-border-soft bg-surface-raised" : "bg-surface-raised"}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-surface-border-soft px-4 py-2.5">
        <span className="text-[14px] font-black text-text-primary">{entry.label}</span>
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
          className="ml-auto text-[12.5px] font-black text-brand-primary hover:underline"
        >
          {showSource ? '소스 숨기기' : '소스 보기'}
        </button>
      </div>

      <div className="grid min-h-[104px] place-items-center bg-surface-muted p-5">
        <Component {...props} />
      </div>

      {showSource &&
        sources.map((source) => (
          <div key={source.file} className="border-t border-surface-border-soft">
            <div className="bg-surface-raised px-3 py-2 font-mono text-[12px] font-black text-text-muted">
              {source.file}
            </div>
            <pre className="overflow-x-auto bg-surface-muted px-4 py-3 font-mono text-[12.5px] leading-6 text-text-primary">
              {source.code}
            </pre>
          </div>
        ))}
    </div>
  )
}
