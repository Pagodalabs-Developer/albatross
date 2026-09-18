

const ALLOWED_TAGS =
  /^(p|br|strong|b|em|i|s|u|h1|h2|h3|h4|h5|h6|ul|ol|li|blockquote|code|pre|hr|a)$/;

export function sanitizeRichText(html: string): string {
  return html
    // Attribute values may contain ">", so quoted runs are matched explicitly.
    .replace(/<(\/?)([a-zA-Z0-9-]+)((?:"[^"]*"|'[^']*'|[^'">])*)\/?>/g, (_all, close, name, attrs) => {
      const tag = String(name).toLowerCase();
      if (!ALLOWED_TAGS.test(tag)) return "";
      if (close) return `</${tag}>`;
      if (tag === "a") {
        const href = /href\s*=\s*"(https?:\/\/[^"]*)"/i.exec(attrs)?.[1];
        return href ? `<a href="${href}" target="_blank" rel="noreferrer">` : "<a>";
      }
      return `<${tag}>`;
    })
    // A truncated trailing tag would otherwise swallow following markup.
    .replace(/<[^>]*$/, "")
    .trim();
}

export const isEmptyRichText = (html?: string) =>
  !html || sanitizeRichText(html).replace(/<[^>]+>|&nbsp;|\s/g, "") === "";
