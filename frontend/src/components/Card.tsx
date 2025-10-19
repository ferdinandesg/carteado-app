import { HtmlHTMLAttributes } from "react";

import styles from "@/styles/Card.module.scss";
import classNames from "classnames";
import { Card } from "shared/cards";
import Image from "next/image";
import { useSession } from "next-auth/react";
interface CardComponentProps extends HtmlHTMLAttributes<HTMLDivElement> {
  card: Card;
  height?: number;
  canHover?: boolean;
  isHidden?: boolean;
}

type AvailableSkins = "basics/white" | "basics/black" | "poker" | "8bit";
const ROOT_PATH = "/assets/skins";
const handleSkinPath = (skin: AvailableSkins, card: Card, isHidden: boolean) => {
  const cardPath = `${card.suit}/${card.rank}${card.suit}.png`;

  if (card.isHidden || isHidden) {
    return `${ROOT_PATH}/${skin}/backs/back_blue_1.png`;
  }

  return `${ROOT_PATH}/${skin}/${cardPath}`;
};

const CARD_RATIO = 63 / 88; // ~0.72

export default function CardComponent({
  card,
  height = 70,
  isHidden = false,
  canHover = false,
  ...rest
}: CardComponentProps) {
  const { data } = useSession();
  const userSkin = (data?.user?.skin as AvailableSkins) || "8bit";
  const cardURL = handleSkinPath(userSkin, card, isHidden);

  const width = height * CARD_RATIO;

  if (!height || !width) return null;
  return (
    <div
      {...rest}
      className={classNames(styles.Card,
        {
          [styles.canHover]: canHover,
        }
      )}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}>
      <Image
        src={cardURL}
        alt="Carta"
        width={100}
        height={100}
        priority
      />
    </div>
  );
}
