import { useState, useMemo } from "react";
import { Card } from "shared/cards";

export const useCardSelection = (
  initialHand: Card[],
  selectionLimit: number
) => {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  const toggleCard = (card: Card) => {
    setSelectedCards((prevSelected) => {
      const isAlreadySelected = prevSelected.some(
        (c) => c.toString === card.toString
      );

      if (isAlreadySelected) {
        return prevSelected.filter((c) => c.toString !== card.toString);
      } else if (prevSelected.length < selectionLimit) {
        return [...prevSelected, card];
      }
      return prevSelected;
    });
  };

  const availableCards = useMemo(() => {
    return initialHand.filter(
      (handCard) =>
        !selectedCards.some(
          (selected) => selected.toString === handCard.toString
        )
    );
  }, [initialHand, selectedCards]);

  const isSelectionComplete = selectedCards.length === selectionLimit;

  const resetSelection = () => {
    setSelectedCards([]);
  };

  return {
    selectedCards,
    availableCards,
    toggleCard,
    isSelectionComplete,
    resetSelection,
  };
};
