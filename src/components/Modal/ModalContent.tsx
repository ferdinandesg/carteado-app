import { HtmlHTMLAttributes } from "react";

interface ContentProps extends HtmlHTMLAttributes<HTMLDivElement> {}

export default function Content({ ...props }: ContentProps) {
  return <div className="p-2 h-full bg-white">{props.children}</div>;
}
