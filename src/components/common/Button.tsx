import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title?: string;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  children,
  onClick,
  disabled,
  loading = false,
  variant = "primary",
  size = "md",
  icon,
  className = "",
  type = "button",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer gap-2";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs font-semibold h-8",
    md: "px-4 py-2 text-sm font-semibold h-10",
    lg: "px-6 py-2.5 text-sm sm:text-base font-bold h-11 sm:h-12",
  };

  const variantClasses = {
    primary:
      "bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm hover:shadow focus:ring-cyan-500 border border-cyan-600",
    secondary:
      "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 focus:ring-slate-400",
    outline:
      "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 shadow-sm focus:ring-cyan-500",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500 border border-rose-600",
    ghost:
      "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" size={size === "sm" ? 14 : 16} />
          <span>{typeof children === "string" ? children : title || "Processing..."}</span>
        </>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children || title}
        </>
      )}
    </button>
  );
};

export default Button;