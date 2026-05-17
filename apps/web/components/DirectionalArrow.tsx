"use client";

import { useDirection } from "@/components/ui/direction";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ComponentProps } from "react";

export function BackArrow(props: ComponentProps<typeof ArrowLeft>) {
  const direction = useDirection();
  const Icon = direction === "rtl" ? ArrowRight : ArrowLeft;
  return <Icon {...props} />;
}
