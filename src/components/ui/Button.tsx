
import React, {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "ghost"
    | "outline"
    | "success";

  size?: "xs" | "sm" | "md" | "lg";

  isLoading?: boolean;

  leftIcon?: ReactNode;

  rightIcon?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}) => {
  // Base button classes
  const baseClasses =
    "btn rounded-sm uppercase tracking-wide font-bold transition-all duration-200";

  // Size classes
  const sizeClasses: Record<
    NonNullable<ButtonProps["size"]>,
    string
  > = {
    xs: "btn-xs",
    sm: "btn-sm",
    md: "",
    lg: "btn-lg",
  };

  // Variant classes
  const variantClasses: Record<
    NonNullable<ButtonProps["variant"]>,
    string
  > = {
    primary:
      "bg-[#0092d1] text-black border-[#0092d1] hover:bg-[#007db3] hover:border-[#007db3]",

    secondary:
      "bg-[#5d6878] text-black border-2 border-[#5d6878] hover:bg-[#354052] hover:border-[#354052]",

    success:
      "bg-[#47d2b2] text-black border-2 border-[#47d2b2] hover:bg-[#35b99b] hover:border-[#35b99b]",

    danger:
      "btn-error text-black border-2 border-error hover:brightness-90",

    ghost:
      "btn-ghost text-black border-2 border-transparent hover:border-base-300",

    outline:
      "btn-outline border-base-300 text-black hover:bg-base-200",
  };

  const combinedClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={combinedClasses}
    >
      {isLoading ? (
        <>
          <span className="loading loading-spinner loading-sm" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && (
            <span className="flex items-center">
              {leftIcon}
            </span>
          )}

          <span>{children}</span>

          {rightIcon && (
            <span className="flex items-center">
              {rightIcon}
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;

