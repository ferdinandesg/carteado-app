"use client";
import React, { useRef, useEffect } from "react";

interface WithSoundOptions {
  hoverSrc?: string;
  clickSrc?: string;
}

type HandlerProps = {
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onClick?: React.MouseEventHandler<HTMLElement>;
  disabled?: boolean;
};

const AUDIO_VOLUME = 0.15;

export function withSound<P extends HandlerProps>(
  WrappedComponent: React.ComponentType<P>,
  { hoverSrc, clickSrc }: WithSoundOptions
): React.FC<P> {
  const ComponentWithSound: React.FC<P> = (props) => {
    const isDisabled = !!props.disabled;
    const hoverAudioRef = useRef<HTMLAudioElement | null>(null);
    const clickAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
      if (hoverSrc && !hoverAudioRef.current) {
        const audio = new Audio(hoverSrc);
        audio.volume = AUDIO_VOLUME;
        hoverAudioRef.current = audio;
      }

      if (clickSrc && !clickAudioRef.current) {
        const audio = new Audio(clickSrc);
        audio.volume = AUDIO_VOLUME;
        clickAudioRef.current = audio;
      }
    }, [hoverSrc, clickSrc]);

    const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
      if (hoverAudioRef.current && !isDisabled) {
        hoverAudioRef.current.play().catch((err) => {
          console.warn("Não foi possível tocar o som de hover:", err);
        });
      }

      if (props.onMouseEnter) {
        props.onMouseEnter(event);
      }
    };

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      if (clickAudioRef.current && !isDisabled) {
        clickAudioRef.current.play().catch((err) => {
          console.warn("Não foi possível tocar o som de clique:", err);
        });
      }

      if (props.onClick) {
        props.onClick(event);
      }
    };

    return (
      <WrappedComponent
        {...props}
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
      />
    );
  };

  return ComponentWithSound;
}
