"use client";

import { useMemo, type ComponentPropsWithoutRef } from "react";
import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";

interface HtmlContentProps extends ComponentPropsWithoutRef<"p"> {
  content: string;
  className?: string;
  style?: React.CSSProperties;
  badgeClassName?: string;
  badgeStyle?: React.CSSProperties;
}

export function HtmlContent({
  content,
  className,
  style,
  badgeClassName,
  badgeStyle,
  ...props
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

    const processedContent = content.replace(
      /۝([\u0660-\u0669]+)/g,
      (match, p1) => {
        return `<span class="${cn(badgeClassName)}" style="${badgeStyleString}">${p1}</span>`;
      },
    );

    if (typeof window === "undefined") return processedContent;

    return DOMPurify.sanitize(processedContent, {
      ALLOWED_TAGS: ["span", "br"],
      ALLOWED_ATTR: ["class", "style"],
    });
  }, [content, badgeClassName, badgeStyle]);

  return (
    <p
      {...props}
      className={cn(className)}
      style={style}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
}
