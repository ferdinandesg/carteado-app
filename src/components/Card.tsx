import { Card } from "@/models/Cards";
import { ReactNode } from "react";
type CardComponentProps = {
  card: Card;
};

export default function CardComponent({ card }: CardComponentProps) {
  return (
    <span
      className="bg-white border rounded p-2 hover:-translate-y-3 transition cursor-pointer"
    >
      {card.toString()}
    </span>
  );
}
