import { forwardRef, InputHTMLAttributes, ReactNode } from "react";
import classNames from "classnames";

import styles from "@/styles/Inputs.module.scss";

type TextInputSize = "md" | "lg";

type TextInputProps = {
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  inputSize?: TextInputSize;
  fullWidth?: boolean;
  inputClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "size">;

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      icon,
      iconPosition = "left",
      inputSize = "md",
      fullWidth = true,
      className,
      inputClassName,
      ...props
    },
    ref
  ) => {
    const leadingIcon = icon && iconPosition === "left" ? icon : null;
    const trailingIcon = icon && iconPosition === "right" ? icon : null;

    return (
      <div
        className={classNames(
          styles.TextInput,
          styles[inputSize],
          {
            [styles.fullWidth]: fullWidth,
          },
          className
        )}>
        {leadingIcon && <span className={styles.icon}>{leadingIcon}</span>}
        <input
          ref={ref}
          className={classNames(styles.input, inputClassName)}
          {...props}
        />
        {trailingIcon && <span className={styles.icon}>{trailingIcon}</span>}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";

export default TextInput;
