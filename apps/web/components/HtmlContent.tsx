"use client";

import DOMPurify from "dompurify";
import { memo, useMemo } from "react";

import { cn } from "@/lib/utils";

const htmlCache = new Map<string, string>();

interface HtmlContentProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
  dir?: "rtl" | "ltr";
  lang?: string;
  badgeClassName?: string;
  badgeStyle?: React.CSSProperties;
}

function HtmlContentBase({
  content,
  className,
  style,
  dir,
  lang,
  badgeClassName,
  badgeStyle,
}: HtmlContentProps) {
  const cleanHtml = useMemo(() => {
    const badgeStyleString = badgeStyle
      ? Object.entries(badgeStyle)
          .map(
            ([k, v]) =>
              `${k.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}:${v}`,
          )
          .join(";")
      : "";

    const cacheKey = [content, badgeClassName ?? "", badgeStyleString].join("|");
    const cached = htmlCache.get(cacheKey);
    if (cached) return cached;

    const processedContent = content.replace(
      /\u06dd([\u0660-\u0669]+)/g,
      (match, p1) => {
        return `<span class="${cn(badgeClassName)}" style="${badgeStyleString}">${p1}</span>`;
      },
    );

    if (typeof window === "undefined") {
      htmlCache.set(cacheKey, processedContent);
      return processedContent;
    }

    const sanitized = DOMPurify.sanitize(processedContent, {
      ALLOWED_TAGS: ["span", "br"],
      ALLOWED_ATTR: ["class", "style"],
    });
    htmlCache.set(cacheKey, sanitized);
    return sanitized;
  }, [content, badgeClassName, badgeStyle]);

  return (
    <p
      className={cn(className)}
      style={style}
      dir={dir}
      lang={lang}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
}

export const HtmlContent = memo(HtmlContentBase);
