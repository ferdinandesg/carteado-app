import React, { CSSProperties, useId } from "react";

import styles from "@/styles/RankMeter.module.scss";

const STAR_POINTS =
  "12,1.8 14.8,8.6 22.2,9.2 16.6,14.1 18.4,21.4 12,17.8 5.6,21.4 7.4,14.1 1.8,9.2 9.2,8.6";

type StarProps = {
  size?: number;
  fillPercentage?: number;
  filterId: string;
  filledGradientId: string;
  emptyGradientId: string;
  shineGradientId: string;
};

function Star({
  size = 50,
  fillPercentage = 100,
  filterId,
  filledGradientId,
  emptyGradientId,
  shineGradientId,
}: StarProps) {
  const clipId = useId();
  const fillHeight = (fillPercentage / 100) * 24;
  const isPartial = fillPercentage > 0 && fillPercentage < 100;
  const showFilled = fillPercentage >= 100;
  const showEmpty = fillPercentage <= 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={styles.star}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id={clipId}>
          <polygon points={STAR_POINTS} />
        </clipPath>
      </defs>

      <g filter={`url(#${filterId})`}>
        {!showFilled && (
          <polygon
            points={STAR_POINTS}
            fill={`url(#${emptyGradientId})`}
            stroke="rgba(255, 255, 255, 0.18)"
            strokeWidth="0.35"
            strokeLinejoin="round"
          />
        )}

        {!showEmpty && (
          <>
            {isPartial ? (
              <rect
                x="0"
                y={24 - fillHeight}
                width="24"
                height={fillHeight}
                fill={`url(#${filledGradientId})`}
                clipPath={`url(#${clipId})`}
              />
            ) : (
              <polygon
                points={STAR_POINTS}
                fill={`url(#${filledGradientId})`}
                stroke="rgba(120, 70, 0, 0.35)"
                strokeWidth="0.35"
                strokeLinejoin="round"
              />
            )}

            {showFilled && (
              <polygon
                points={STAR_POINTS}
                fill={`url(#${shineGradientId})`}
                opacity="0.22"
                clipPath={`url(#${clipId})`}
              />
            )}
          </>
        )}
      </g>
    </svg>
  );
}

type RankMeterProps = {
  maxValue?: number;
  currentValue: number;
  size?: number;
};

export default function RankMeter({
  maxValue = 20,
  currentValue,
  size = 50,
}: RankMeterProps) {
  const filterId = useId();
  const filledGradientId = useId();
  const emptyGradientId = useId();
  const shineGradientId = useId();
  const totalStars = 5;
  const starValue = maxValue / totalStars;
  const fullStars = Math.floor(currentValue / starValue);
  const remainder = ((currentValue % starValue) / starValue) * 100;

  return (
    <div
      className={styles.RankMeter}
      style={{ "--star-size": `${size}px` } as CSSProperties}
      role="img"
      aria-label={`Rating ${currentValue} of ${maxValue}`}>
      <svg
        width="0"
        height="0"
        aria-hidden
        className={styles.defs}>
        <defs>
          <filter
            id={filterId}
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
            colorInterpolationFilters="sRGB">
            <feDropShadow
              dx="0"
              dy="1.2"
              stdDeviation="0.65"
              floodColor="#000000"
              floodOpacity="0.42"
            />
            <feDropShadow
              dx="0"
              dy="-0.4"
              stdDeviation="0.25"
              floodColor="#ffffff"
              floodOpacity="0.18"
            />
          </filter>

          <linearGradient
            id={filledGradientId}
            x1="4"
            y1="3"
            x2="20"
            y2="21"
            gradientUnits="userSpaceOnUse">
            <stop
              offset="0%"
              stopColor="#FFF2A8"
            />
            <stop
              offset="38%"
              stopColor="#FFC933"
            />
            <stop
              offset="100%"
              stopColor="#C88700"
            />
          </linearGradient>

          <linearGradient
            id={emptyGradientId}
            x1="5"
            y1="4"
            x2="19"
            y2="20"
            gradientUnits="userSpaceOnUse">
            <stop
              offset="0%"
              stopColor="#8EB6D9"
            />
            <stop
              offset="55%"
              stopColor="#5E8FB8"
            />
            <stop
              offset="100%"
              stopColor="#3D6588"
            />
          </linearGradient>

          <linearGradient
            id={shineGradientId}
            x1="12"
            y1="2"
            x2="12"
            y2="14"
            gradientUnits="userSpaceOnUse">
            <stop
              offset="0%"
              stopColor="#ffffff"
            />
            <stop
              offset="100%"
              stopColor="#ffffff"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>
      </svg>

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
            filterId={filterId}
            filledGradientId={filledGradientId}
            emptyGradientId={emptyGradientId}
            shineGradientId={shineGradientId}
          />
        );
      })}
    </div>
  );
}
