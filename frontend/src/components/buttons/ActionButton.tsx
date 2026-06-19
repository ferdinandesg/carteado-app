import { ButtonHTMLAttributes, ReactNode } from "react";
import classNames from "classnames";

import { withSound } from "./withSound";

import styles from "@/styles/Buttons.module.scss";

type ActionButtonVariant = "primary" | "secondary" | "accent" | "ghost";
type ActionButtonSize = "sm" | "md" | "lg";

type ActionButtonProps = {
  children: ReactNode;
  variant?: ActionButtonVariant;
  size?: ActionButtonSize;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
  fullWidth?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

function ActionButton({
  children,
  className,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  isLoading = false,
  fullWidth = false,
  disabled,
  ...props
}: ActionButtonProps) {
  const leadingIcon = iconPosition === "left" ? icon : null;
  const trailingIcon = iconPosition === "right" ? icon : null;

  return (
    <button
      {...props}
      className={classNames(
        styles.ActionButton,
        styles[variant],
        styles[size],
        {
          [styles.fullWidth]: fullWidth,
        },
        className
      )}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}>
      {isLoading ? (
        <span
          className="spinner"
          aria-hidden
        />
      ) : (
        leadingIcon
      )}
      <span>{children}</span>
      {!isLoading && trailingIcon}
    </button>
  );
}

export default withSound(ActionButton, {
  clickSrc: "/assets/sfx/button-click.mp3",
});
