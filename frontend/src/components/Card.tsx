import { HTMLAttributes } from "react";
import classNames from "classnames";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion, type HTMLMotionProps } from "motion/react";
import { useTranslation } from "react-i18next";
import { Card } from "shared/cards";

import { getCardScale, type CardSize } from "@/lib/cards/cardSizing";

import styles from "@/styles/Card.module.scss";

type AvailableSkins = "baralho01" | "baralho02" | "baralho03" | "baralho04";

type CardComponentProps = {
  card: Card;
  /** Token relativo a `--card-h` (altura fluida herdada da mesa). */
  size?: CardSize;
  /** Altura fixa em px; ignora `size` e `--card-h`. */
  height?: number;
  canHover?: boolean;
  isHidden?: boolean;
  /** Força o tooltip do poder (seleção por toque no leque). */
  showPowerHint?: boolean;
  /**
   * Quando definido, a carta vira um `motion.div` com layout animation:
   * ao trocar de pai (leque → centro) com o mesmo `layoutId`, ela voa.
   */
  layoutId?: string;
  /** Skin do baralho; se omitida, usa a da sessão. */
  skin?: string;
} & HTMLAttributes<HTMLDivElement>;

const ROOT_PATH = "/assets/skins";

function getSkinPath(skin: string, card: Card, hidden: boolean) {
  if (card.isHidden || hidden) {
    return `${ROOT_PATH}/${skin}/backs/back_1.png`;
  }

  return `${ROOT_PATH}/${skin}/${card.suit}/${card.rank}${card.suit}.png`;
}

export default function CardComponent({
  card,
  size = "md",
  height,
  isHidden = false,
  canHover = false,
  showPowerHint = false,
  layoutId,
  skin,
  className,
  style,
  ...rest
}: CardComponentProps) {
  const { t } = useTranslation();
  const { data } = useSession();
  const userSkin = (data?.user?.skin || "baralho01") as AvailableSkins;
  const hidden = Boolean(card.isHidden || isHidden);
  const cardURL = getSkinPath(skin ?? userSkin, card, hidden);
  const powerId = !hidden ? card.powerId : undefined;
  const powerName = powerId
    ? t(`Powers.${powerId}.name`, { defaultValue: "" })
    : "";
  const powerDescription = powerId
    ? t(`Powers.${powerId}.description`, { defaultValue: "" })
    : "";

  const mergedClassName = classNames(styles.Card, className, {
    [styles.canHover]: canHover,
    [styles.showHint]: showPowerHint,
    [styles.illusion]: Boolean(card.illusionReal),
  });

  const mergedStyle = {
    ...style,
    "--card-scale": getCardScale(size),
    ...(height !== undefined ? { "--card-fixed-height": `${height}px` } : {}),
  } as React.CSSProperties;

  const body = (
    <>
      <div className={styles.face}>
        <Image
          src={cardURL}
          alt={card.toString}
          fill
          sizes="(max-width: 768px) 25vw, 200px"
          className={styles.image}
          draggable={false}
        />
      </div>
      {powerId && (
        <span
          className={classNames(styles.powerBadge, styles[powerId])}
          aria-hidden>
          <Sparkles size={12} />
        </span>
      )}
      {powerId && powerDescription && (
        <span
          className={styles.powerHint}
          role="tooltip">
          <strong>{powerName}</strong>
          {powerDescription}
        </span>
      )}
    </>
  );

  if (layoutId) {
    return (
      <motion.div
        {...(rest as unknown as HTMLMotionProps<"div">)}
        layoutId={layoutId}
        layout
        className={mergedClassName}
        style={mergedStyle}>
        {body}
      </motion.div>
    );
  }

  return (
    <div
      {...rest}
      className={mergedClassName}
      style={mergedStyle}>
      {body}
    </div>
  );
}

export type { CardSize };
