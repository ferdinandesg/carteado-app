import { Card } from "@/models/Cards";
import { ReactNode, HtmlHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
interface CardComponentProps extends HtmlHTMLAttributes<HTMLDivElement> {
  card: Card;
}

export default function CardComponent({ card,...rest }: CardComponentProps) {
  return (
    <div
      {...rest}
      className={twMerge(
        "bg-white border rounded p-2 transition cursor-pointer w-32",
        rest?.className,
        'hidden' in card && card.hidden ? "opacity-50" : ""
      )}
    >
      {card.toString}
    </div>
  );
}
