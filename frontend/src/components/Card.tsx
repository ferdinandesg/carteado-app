import { HtmlHTMLAttributes } from "react";

import styles from "@styles/Card.module.scss";
import classNames from "classnames";
import { Card } from "shared/cards";
import Image from "next/image";
interface CardComponentProps extends HtmlHTMLAttributes<HTMLDivElement> {
  card: Card;
  height?: number;
}

type AvailableSkins = "basics/white" | "basics/black" | "poker" | "8bit";
const ROOT_PATH = "/assets/skins";
const handleSkinPath = (skin: AvailableSkins, card: Card) => {
  const cardPath = `${card.suit}/${card.rank}${card.suit}.png`;

  const isHidden = card.hidden;

  if (isHidden) {
    return `${ROOT_PATH}/${skin}/backs/back_blue_1.png`;
  }

  return `${ROOT_PATH}/${skin}/${cardPath}`;
};

const CARD_RATIO = 63 / 88; // ~0.72

export default function CardComponent({
  card,
  height = 70,
  ...rest
}: CardComponentProps) {
  const cardURL = handleSkinPath("8bit", card);
  const width = height * CARD_RATIO;
  return (
    <div
      {...rest}
      className={classNames(styles.Card)}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}>
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
