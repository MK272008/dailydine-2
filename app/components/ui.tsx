import Link, { LinkProps } from "next/link";
import { ComponentPropsWithoutRef, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonLinkProps = LinkProps &
  Omit<ComponentPropsWithoutRef<"a">, keyof LinkProps> & {
    variant?: ButtonVariant;
    children: ReactNode;
  };

export function ButtonLink({ variant = "primary", className = "", children, ...props }: ButtonLinkProps) {
  return (
    <Link
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-4 py-3 text-[0.84rem] font-extrabold no-underline transition hover:-translate-y-0.5 hover:shadow-daily-soft ${
        variant === "secondary"
          ? "border-line bg-transparent text-wine hover:bg-paper-deep"
          : "border-wine bg-wine text-surface hover:bg-wine-deep"
      }${className ? ` ${className}` : ""}`}
      {...props}
    >
      {children}
    </Link>
  );
}

export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`rounded-full border border-terracotta/25 bg-soft px-3 py-1.5 text-[0.67rem] font-extrabold uppercase tracking-[0.06em] text-terracotta${className ? ` ${className}` : ""}`}>
      {children}
    </span>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`m-auto w-full max-w-5xl rounded-[2rem] border border-line bg-surface p-6 shadow-daily md:p-12${className ? ` ${className}` : ""}`}>
      {children}
    </section>
  );
}
