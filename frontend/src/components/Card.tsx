import { HTMLAttributes } from "react";
import classNames from "classnames";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Card } from "shared/cards";

import {
  getCardWidth,
  resolveCardHeight,
  type CardSize,
} from "@/lib/cards/cardSizing";

import styles from "@/styles/Card.module.scss";

type AvailableSkins = "basics/white" | "basics/black" | "poker" | "8bit";

type CardComponentProps = {
  card: Card;
  size?: CardSize;
  height?: number;
  canHover?: boolean;
  isHidden?: boolean;
} & HTMLAttributes<HTMLDivElement>;

const ROOT_PATH = "/assets/skins";

function getSkinPath(skin: AvailableSkins, card: Card, hidden: boolean) {
  if (card.isHidden || hidden) {
    return `${ROOT_PATH}/${skin}/backs/back_blue_1.png`;
  }

  return `${ROOT_PATH}/${skin}/${card.suit}/${card.rank}${card.suit}.png`;
}

export default function CardComponent({
  card,
  size = "md",
  height,
  isHidden = false,
  canHover = false,
  className,
  style,
  ...rest
}: CardComponentProps) {
  const { data } = useSession();
  const userSkin = (data?.user?.skin as AvailableSkins) || "8bit";
  const resolvedHeight = resolveCardHeight(size, height);
  const resolvedWidth = getCardWidth(resolvedHeight);
  const cardURL = getSkinPath(userSkin, card, isHidden);

  return (
    <div
      {...rest}
      className={classNames(styles.Card, className, {
        [styles.canHover]: canHover,
      })}
      style={
        {
          ...style,
          "--card-height": `${resolvedHeight}px`,
        } as React.CSSProperties
      }>
      <Image
        src={cardURL}
        alt={card.toString}
        fill
        sizes={`${resolvedWidth}px`}
        className={styles.image}
        draggable={false}
      />
    </div>
  );
}

export type { CardSize };
