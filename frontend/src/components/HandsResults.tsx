import { Card } from "shared/cards";
import CardComponent from "./Card";

import styles from "@/styles/HandsResults.module.scss";

type HandsResultsProps = {
    cards: Card[];
}
export default function HandsResults({ cards }: HandsResultsProps) {
    return (
        <div className={styles.HandsResults}>
            <div className={styles.wrap}>
                {cards.map((card, index) => {
                    return (
                        <div className={styles.card} key={`${card.toString}-${index}`}>
                            <CardComponent card={card} height={100} />
                        </div>
                    );
                })}
            </div>
        </div>
    );

}