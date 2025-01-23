import { HtmlHTMLAttributes } from "react";

import styles from "@styles/Card.module.scss";
import classNames from "classnames";
import { Card } from "shared/cards";
import Image from "next/image";
interface CardComponentProps extends HtmlHTMLAttributes<HTMLDivElement> {
  card: Card;
}

type AvailableSkins = "basics-dark" | "basics-light" | "poker" | "8bit";
const ROOT_PATH = "/assets/skins/";
const handleSkinPath = (skin: AvailableSkins, card: Card) => {
  switch (skin) {
    case "basics-light":
      return `${ROOT_PATH}basics/white/${card.suit}/${card.rank}${card.suit}.png`;
    case "basics-dark":
      return `${ROOT_PATH}basics/black/${card.suit}/${card.rank}${card.suit}.png`;
    case "poker":
      return `${ROOT_PATH}poker/${card.suit}/${card.rank}${card.suit}.png`;
    case "8bit":
      return `${ROOT_PATH}8bit/${card.suit}/${card.rank}${card.suit}.png`;
    default:
      return `${ROOT_PATH}8bit/${card.suit}/${card.rank}${card.suit}.png`;
  }
};

export default function CardComponent({ card, ...rest }: CardComponentProps) {
  const cardURL = handleSkinPath("8bit", card);
  return (
    <div
      {...rest}
      className={classNames(styles.Card)}>
      <Image
        src={cardURL}
        alt="Carta"
        layout="fill"
        objectFit="contain"
        priority
      />
    </div>
  );
}
