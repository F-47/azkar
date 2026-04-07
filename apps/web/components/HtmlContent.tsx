"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";

interface HtmlContentProps {
  content: string;
  className?: string;
  badgeClassName?: string;
}

export function HtmlContent({
  content,
  className,
  badgeClassName,
}: HtmlContentProps) {
  const cleanHtml = useMemo(() => {
    const processedContent = content.replace(
      /۝([\u0660-\u0669]+)/g,
      (match, p1) => {
        return `<span class="${cn(badgeClassName)}">${p1}</span>`;
      },
    );

    if (typeof window === "undefined") return processedContent;

    return DOMPurify.sanitize(processedContent, {
      ALLOWED_TAGS: ["span", "br"],
      ALLOWED_ATTR: ["class"],
    });
  }, [content, badgeClassName]);

  return (
    <p
      className={cn(className)}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
}
