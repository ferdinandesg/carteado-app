import { HtmlHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export default function Content({
  ...props
}: HtmlHTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge("p-2 h-full bg-white", props.className)}>
      {props.children}
    </div>
  );
}
