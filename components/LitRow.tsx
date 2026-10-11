"use client";

/** A row on the open floor: the amber rake pools where the pointer is. */
export default function LitRow({
  children,
  className = "",
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--gx", `${(e.clientX - r.left).toFixed(0)}px`);
    el.style.setProperty("--gy", `${(e.clientY - r.top).toFixed(0)}px`);
  };

  const Tag = as as any;
  return (
    <Tag onPointerMove={onMove} className={`lit-row ${className}`}>
      {children}
    </Tag>
  );
}
