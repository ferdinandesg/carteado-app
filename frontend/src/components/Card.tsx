import { HTMLAttributes } from "react";
import classNames from "classnames";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { motion, type HTMLMotionProps } from "motion/react";
import { Card } from "shared/cards";

import { getCardScale, type CardSize } from "@/lib/cards/cardSizing";

import styles from "@/styles/Card.module.scss";

type AvailableSkins =
  | "basics/white"
  | "basics/black"
  | "poker"
  | "8bit"
  | "baralho01";

type CardComponentProps = {
  card: Card;
  /** Token relativo a `--card-h` (altura fluida herdada da mesa). */
  size?: CardSize;
  /** Altura fixa em px; ignora `size` e `--card-h`. */
  height?: number;
  canHover?: boolean;
  isHidden?: boolean;
  /**
   * Quando definido, a carta vira um `motion.div` com layout animation:
   * ao trocar de pai (leque → centro) com o mesmo `layoutId`, ela voa.
   */
  layoutId?: string;
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
  layoutId,
  className,
  style,
  ...rest
}: CardComponentProps) {
  const { data } = useSession();
  const userSkin = (data?.user?.skin as AvailableSkins) || "baralho01";
  const cardURL = getSkinPath(userSkin, card, isHidden);

  const mergedClassName = classNames(styles.Card, className, {
    [styles.canHover]: canHover,
  });

  const mergedStyle = {
    ...style,
    "--card-scale": getCardScale(size),
    ...(height !== undefined ? { "--card-fixed-height": `${height}px` } : {}),
  } as React.CSSProperties;

  const image = (
    <Image
      src={cardURL}
      alt={card.toString}
      fill
      sizes="(max-width: 768px) 25vw, 200px"
      className={styles.image}
      draggable={false}
    />
  );

  if (layoutId) {
    return (
      <motion.div
        {...(rest as unknown as HTMLMotionProps<"div">)}
        layoutId={layoutId}
        layout
        className={mergedClassName}
        style={mergedStyle}>
        {image}
      </motion.div>
    );
  }

  return (
    <div
      {...rest}
      className={mergedClassName}
      style={mergedStyle}>
      {image}
    </div>
  );
}

export type { CardSize };
