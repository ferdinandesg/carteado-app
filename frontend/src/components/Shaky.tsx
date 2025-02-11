import React from "react";
import classNames from "classnames";
import styles from "@/styles/Shaky.module.scss";
import { useShake } from "@hooks/useShaky";

type ShakyProps = {
    value: any;
    children: React.ReactNode;
    duration?: number;
}

export default function Shaky({ value, children, duration = 500 }: ShakyProps) {
    const animate = useShake(value, duration);

    return (
        <span className={classNames(animate && styles.animate)}>
            {children}
        </span>
    );
};
