import { writeText as writeClipboardText } from "@tauri-apps/plugin-clipboard-manager";

/**
 * Tauri 플러그인 → 브라우저 API → execCommand 순으로 시도한다.
 * 웹 개발 서버에는 플러그인이 없고, 오래된 WebView에는 navigator.clipboard가 없다.
 */
export async function copyToClipboard(value: string) {
  try {
    await writeClipboardText(value);
    return;
  } catch {
    // 웹 개발 서버에서는 Tauri 플러그인이 없을 수 있어 브라우저 방식으로 보완한다.
  }
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }
  } catch {
    // API가 있어도 권한·포커스·비보안 컨텍스트 때문에 거부될 수 있다. 그때도 아래로 내려간다.
  }
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("CLIPBOARD_UNAVAILABLE");
}
