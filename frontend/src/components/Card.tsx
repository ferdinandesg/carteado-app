import { Card } from "@/models/Cards";
import { HtmlHTMLAttributes } from "react";

import styles from "@styles/Card.module.scss";
import classNames from "classnames";
interface CardComponentProps extends HtmlHTMLAttributes<HTMLDivElement> {
  card: Card;
}

export default function CardComponent({ card, ...rest }: CardComponentProps) {
  return (
    <div
      {...rest}
      className={classNames(
        styles.Card,
        card.hidden && styles.hidden,
      )}
    >
      {card.toString}
    </div>
  );
}
