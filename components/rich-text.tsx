import { sanitizeRichText } from "@/lib/rich-text";

export function RichText({ value, className = "" }: { value: string; className?: string }) {
  return (
    <div
      className={`[&_a]:text-brand [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_li]:ml-4 [&_ol]:list-decimal [&_p+p]:pt-4 [&_ul]:list-disc ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(value) }}
    />
  );
}
