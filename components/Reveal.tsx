"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  /** stagger index within a group — later items light a beat after */
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article";
};

export default function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div",
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const [lit, setLit] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const t = setTimeout(() => setLit(true), delay);
            io.disconnect();
            return () => clearTimeout(t);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  const Tag = as as any;
  return (
    <Tag ref={ref} className={`reveal ${lit ? "lit" : ""} ${className}`}>
      {children}
    </Tag>
  );
}
