import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const base = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    const variants = {
      default: "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90",
      destructive: "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:opacity-90",
      outline: "border border-[hsl(var(--input))] bg-transparent hover:bg-[hsl(var(--accent))]",
      secondary: "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:opacity-80",
      ghost: "hover:bg-[hsl(var(--accent))]",
      link: "text-primary underline-offset-4 hover:underline",
    };
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    };
    return (
      <button
        className={cn(base, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
