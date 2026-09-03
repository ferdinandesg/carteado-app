import { HTMLAttributes } from "react";
import classNames from "classnames";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion, type HTMLMotionProps } from "motion/react";
import { Card } from "shared/cards";

import {
  resolveSkin,
  type SkinOption,
} from "@/components/GuestCustomizer/constants";
import PowerHint from "@/components/PowerHint";
import { useSkinOverride } from "@/contexts/skinOverride";
import { getCardScale, type CardSize } from "@/lib/cards/cardSizing";

import styles from "@/styles/Card.module.scss";

export type AvailableSkins = SkinOption;

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
  const { data } = useSession();
  const skinOverride = useSkinOverride();
  const hidden = Boolean(card.isHidden || isHidden);
  // Prop (preview pontual) > contexto (sandbox) > sessão.
  const cardURL = getSkinPath(
    skin ?? skinOverride ?? resolveSkin(data?.user?.skin),
    card,
    hidden
  );
  const powerId = !hidden ? card.powerId : undefined;

  const mergedClassName = classNames(styles.Card, className, {
    [styles.canHover]: canHover,
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
          key={cardURL}
          src={cardURL}
          alt={card.toString}
          fill
          unoptimized
          sizes="(max-width: 768px) 25vw, 200px"
          className={styles.image}
          draggable={false}
        />
      </div>
      {powerId && (
        <>
          <span
            className={classNames(styles.powerBadge, styles[powerId])}
            aria-hidden>
            <Sparkles size={12} />
          </span>
          <PowerHint
            powerId={powerId}
            visible={showPowerHint}
          />
        </>
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
