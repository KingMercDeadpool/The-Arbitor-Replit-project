import React from "react";
import { cn } from "@/lib/utils";

interface ShinyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "gold";
}

export const ShinyButton = React.forwardRef<HTMLButtonElement, ShinyButtonProps>(
  ({ className, variant = "primary", children, ...props }, ref) => {
    
    const variants = {
      primary: "bg-slate-800 text-slate-100 hover:bg-slate-700 border-slate-700",
      secondary: "bg-slate-900/50 text-slate-400 hover:bg-slate-900 border-slate-800",
      danger: "bg-red-950/40 text-red-200 hover:bg-red-900/60 border-red-900/50",
      ghost: "bg-transparent hover:bg-white/5 text-slate-400 border-transparent",
      gold: "bg-amber-600/20 text-amber-200 hover:bg-amber-600/30 border-amber-600/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "relative px-4 py-2 rounded-lg font-medium transition-all duration-200",
          "border backdrop-blur-sm",
          "active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
ShinyButton.displayName = "ShinyButton";
