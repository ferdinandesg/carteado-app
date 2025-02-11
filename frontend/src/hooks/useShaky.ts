import { useState, useEffect, useRef } from "react";

export function useShake<T>(value: T, duration = 500): boolean {
  const [animate, setAnimate] = useState(false);
  const previousValue = useRef<T | undefined>(undefined);

  useEffect(() => {
    if (
      previousValue.current !== undefined &&
      previousValue.current !== value
    ) {
      setAnimate(true);
      const timer = setTimeout(() => {
        setAnimate(false);
      }, duration);
      return () => clearTimeout(timer);
    }
    previousValue.current = value;
  }, [value, duration]);

  return animate;
}
