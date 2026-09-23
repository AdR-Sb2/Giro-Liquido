import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "bg-brand-500 text-slate-950 hover:bg-brand-400",
  secondary: "bg-slate-800 text-white hover:bg-slate-700",
  ghost: "bg-transparent border border-slate-700 text-slate-200 hover:bg-slate-900",
  destructive: "bg-red-500 text-white hover:bg-red-400",
};

const sizes = {
  default: "h-11 px-4 py-2 text-sm font-medium",
  sm: "h-9 px-3 text-xs",
  lg: "h-12 px-5 text-base",
  icon: "h-10 w-10",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  asChild?: boolean;
}

export function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const baseClass = cn(
    "inline-flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>;

    return React.cloneElement(child, {
      className: cn(baseClass, child.props.className),
      ...props,
    });
  }

  return (
    <button className={baseClass} {...props}>
      {children}
    </button>
  );
}
