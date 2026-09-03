import { Card, RANK_TO_VALUE, type Rank, type Value } from "shared/cards";

import CardFan from "@/components/CardFan";
import {
  CARD_SIZES,
  getCardWidth,
  type CardSize,
} from "@/lib/cards/cardSizing";

import styles from "@/styles/SkinPreview.module.scss";

const ROYALTY_RANKS: Rank[] = ["J", "Q", "K"];

/** Realeza de paus: as três cartas que melhor mostram a arte de um baralho. */
export const SKIN_PREVIEW_CARDS: Card[] = ROYALTY_RANKS.map((rank) => ({
  rank,
  suit: "clubs",
  value: RANK_TO_VALUE[rank] as Value,
  secondaryValue: null,
  toString: `${rank} of clubs`,
}));

type SkinPreviewProps = {
  skin: string;
  /** Altura da carta; o leque herda o hover/expansão do `CardFan`. */
  size?: CardSize;
};

/**
 * Amostra de um baralho: leque estático com J/Q/K usando a mesma física de
 * hover do leque da mão. Reutilizado no seletor de skins e na loja.
 */
export default function SkinPreview({ skin, size = "sm" }: SkinPreviewProps) {
  const height = CARD_SIZES[size];
  return (
    <div
      className={styles.skinPreview}
      style={
        {
          "--card-h": `${height}px`,
          "--card-w": `${getCardWidth(height)}px`,
        } as React.CSSProperties
      }>
      <CardFan
        cards={SKIN_PREVIEW_CARDS}
        skin={skin}
        size="lg"
        enableLayout={false}
      />
    </div>
  );
}
