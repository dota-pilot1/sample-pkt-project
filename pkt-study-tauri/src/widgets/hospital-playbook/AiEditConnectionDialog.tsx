import ApiGuideDialogShell from "./ApiGuideDialogShell";
import { LexicalEditor } from "../../shared/ui/lexical/lexical-editor";
import { DOCUMENT_API_SAMPLE_LEXICAL_STATE } from "./documentApiSamples";

type AiEditConnectionDialogProps = {
  connection: string;
  onClose: () => void;
};

export default function AiEditConnectionDialog({ connection, onClose }: AiEditConnectionDialogProps) {
  return (
    <ApiGuideDialogShell
      title="AI 편집 연결 정보"
      description="발급된 1회용 토큰으로 문서 전체 본문을 조회·수정할 수 있습니다."
      copyText={connection}
      onClose={onClose}
      ariaLabel="AI 편집 연결 정보"
      contentAriaLabel="AI 편집 연결 정보"
      previewAriaLabel="Lexical 본문 샘플"
      previewTitle="실제 Lexical 본문 샘플"
      previewDescription="AI가 PATCH할 때 유지해야 하는 Lexical 문서 구조 예시입니다."
      preview={
        <div className="p-4">
          <LexicalEditor
            initialState={DOCUMENT_API_SAMPLE_LEXICAL_STATE}
            onChange={() => undefined}
            readOnly
            minHeight="620px"
            scrollable
          />
        </div>
      }
      footer="content는 기존 Lexical 문서 구조를 유지한 JSON 문자열로 보내고, 저장 전 최신 version을 expectedVersion에 사용하세요. 토큰은 한 번 저장한 뒤 폐기되며 만료 시간 이후에는 사용할 수 없습니다."
    >
      <pre className="whitespace-pre-wrap bg-surface-muted px-5 py-4 font-mono text-[11px] leading-5 text-text-primary">{connection}</pre>
    </ApiGuideDialogShell>
  );
}
