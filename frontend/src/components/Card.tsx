import { HtmlHTMLAttributes } from "react";

import styles from "@styles/Card.module.scss";
import classNames from "classnames";
import { Card } from "shared/cards";
interface CardComponentProps extends HtmlHTMLAttributes<HTMLDivElement> {
  card: Card;
}

export default function CardComponent({ card, ...rest }: CardComponentProps) {
  return (
    <div
      {...rest}
      className={classNames(styles.Card, card.hidden && styles.hidden)}>
      {card.toString}
    </div>
  );
}
