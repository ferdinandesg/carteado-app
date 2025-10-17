import React, { useId } from "react";

import styles from "@/styles/RankMeter.module.scss";

interface StarProps {
  size?: number;
  fillPercentage?: number;
  color?: string;
  stars?: number;
  backgroundColor?: string;
}

const Star: React.FC<StarProps> = ({
  size = 50,
  fillPercentage = 100,
  color = "gold",
  backgroundColor = "lightgray",
}) => {
  const id = useId();
  const fillHeight = (fillPercentage / 100) * 24;
  const clipPathId = `clip-star-${id}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id={clipPathId}>
          <polygon points="12,2 15,9 23,9 17,14 19,22 12,18 5,22 7,14 1,9 9,9" />
        </clipPath>
      </defs>

      <polygon
        points="12,2 15,9 23,9 17,14 19,22 12,18 5,22 7,14 1,9 9,9"
        fill={backgroundColor}
      />

      <rect
        x="0"
        y={24 - fillHeight}
        width="24"
        height={fillHeight}
        fill={color}
        clipPath={`url(#${clipPathId})`}
      />
    </svg>
  );
};

type StarRatingProps = {
  maxValue?: number;
  currentValue: number;
  size?: number;
  color?: string;
  backgroundColor?: string;
};

const RankMeter: React.FC<StarRatingProps> = ({
  maxValue = 20,
  currentValue,
  size = 50,
  color = "gold",
  backgroundColor = "lightgray",
}) => {
  const totalStars = 5;
  const starValue = maxValue / totalStars;
  const fullStars = Math.floor(currentValue / starValue);
  const remainder = ((currentValue % starValue) / starValue) * 100;

  return (
    <div className={styles.RankMeter}>
      {Array.from({ length: totalStars }).map((_, index) => {
        let fillPercentage = 0;
        if (index < fullStars) {
          fillPercentage = 100;
        } else if (index === fullStars) {
          fillPercentage = remainder;
        }
        return (
          <Star
            key={index}
            fillPercentage={fillPercentage}
            size={size}
            color={color}
            backgroundColor={backgroundColor}
          />
        );
      })}
    </div>
  );
};

export default RankMeter;
