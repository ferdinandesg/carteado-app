import { HtmlHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface ContentProps extends HtmlHTMLAttributes<HTMLDivElement> {}

export default function Content({ ...props }: ContentProps) {
  return <div className={twMerge("p-2 h-full bg-white", props.className)}>{props.children}</div>;
}
