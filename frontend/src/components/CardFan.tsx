import { useState } from "react";
import classNames from "classnames";
import { Card } from "shared/cards";

import CardComponent from "./Card";
import { getCardKeys } from "@/lib/cards/cardKey";
import { getCardScale, type CardSize } from "@/lib/cards/cardSizing";
import { useCoarsePointer } from "@/hooks/useMediaQuery";
import styles from "@/styles/CardFan.module.scss";

type CardFanProps = {
  cards: Card[];
  onClick?: (card: Card) => void;
  size?: CardSize;
  /** Bloqueia interação (ex.: truco pendente, não é meu turno). */
  disabled?: boolean;
  /** Prefixo do `layoutId` para animar a carta ao sair do leque. */
  layoutPrefix?: string;
  /** Skin do baralho; se omitida, cada carta usa a da sessão. */
  skin?: string;
  /** Desliga `layoutId` (preview estático, ex.: loja). */
  enableLayout?: boolean;
  testId?: string;
};

/**
 * Leque de cartas em arco. Toda a geometria é CSS (`--i`, `--n`); o espaçamento
 * comprime automaticamente via container query quando o leque não cabe.
 * Em toque: primeiro tap seleciona/eleva, segundo tap joga.
 */
export default function CardFan({
  cards,
  onClick = () => {},
  size = "lg",
  disabled = false,
  layoutPrefix = "card",
  skin,
  enableLayout = true,
  testId,
}: CardFanProps) {
  const isTouch = useCoarsePointer();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const keys = getCardKeys(cards);
  const activeKey =
    selectedKey && keys.includes(selectedKey) ? selectedKey : null;

  const handleSelect = (card: Card, key: string) => {
    if (disabled) return;

    if (isTouch && activeKey !== key) {
      setSelectedKey(key);
      return;
    }

    setSelectedKey(null);
    onClick(card);
  };

  return (
    <div
      className={classNames(styles.cardFan, { [styles.disabled]: disabled })}
      style={
        {
          "--n": cards.length,
          "--fan-scale": getCardScale(size),
        } as React.CSSProperties
      }
      data-testid={testId}
      role="list">
      {cards.map((card, index) => {
        const key = keys[index];
        return (
          <div
            key={key}
            role="listitem"
            className={classNames(styles.cardWrapper, {
              [styles.selected]: activeKey === key,
            })}
            style={{ "--i": index } as React.CSSProperties}
            onClick={() => handleSelect(card, key)}>
            <CardComponent
              card={card}
              size={size}
              skin={skin}
              layoutId={enableLayout ? `${layoutPrefix}-${key}` : undefined}
              showPowerHint={activeKey === key}
            />
          </div>
        );
      })}
    </div>
  );
}
