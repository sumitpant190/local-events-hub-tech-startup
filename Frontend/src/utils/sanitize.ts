// Client-side cleanup only. The backend must re-validate and escape everything it stores;
// this just keeps obvious junk out of the UI until that exists.
export const MAX_COMMENT_LENGTH = 280;

const SCRIPT_BLOCK = /<script\b[^>]*>[\s\S]*?<\/script\s*>/gi;
const HTML_TAG = /<\/?[a-z][^>]*>/gi;
// C0 control characters except tab (\t) and newline (\n), plus DEL.
const CONTROL_CHARS = /[\u0000-\u0008\u000B-\u001F\u007F]/g;
const EXCESS_BLANK_LINES = /\n{3,}/g;

export function sanitizeComment(raw: string): string {
  return raw
    .replace(/\r\n?/g, '\n')
    .replace(SCRIPT_BLOCK, '')
    .replace(HTML_TAG, '')
    .replace(CONTROL_CHARS, '')
    .replace(EXCESS_BLANK_LINES, '\n\n')
    .trim()
    .slice(0, MAX_COMMENT_LENGTH)
    .trim();
}
