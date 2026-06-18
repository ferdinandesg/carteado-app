import classNames from "classnames";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { CircleX } from "lucide-react";
import styles from "@/styles/GuestCustomizer.module.scss";

import { avatarOptions } from "./constants";

interface AvatarSectionProps {
  avatar: string | null;
  onSelectAvatar: (avatar: string | null) => void;
}

export default function AvatarSection({
  avatar,
  onSelectAvatar,
}: AvatarSectionProps) {
  const { t } = useTranslation();
  return (
    <section
      className={styles.formGroup}
      aria-labelledby="guest-avatar-options-label">
      <label id="guest-avatar-options-label">{t("Home.ChooseAvatar")}</label>
      <div
        className={styles.avatarList}
        role="group"
        aria-labelledby="guest-avatar-options-label"
        data-testid="avatar-section">
        <button
          type="button"
          className={classNames(styles.optionButton, styles.avatarOption, {
            [styles.selected]: avatar === null,
          })}
          onClick={() => onSelectAvatar(null)}
          aria-pressed={avatar === null}
          aria-label={t("Home.noAvatar")}
          data-testid="avatar-option-none">
          <CircleX size={40} />
        </button>

        {avatarOptions.map((src, i) => (
          <button
            key={src}
            type="button"
            className={classNames(styles.optionButton, styles.avatarOption, {
              [styles.selected]: avatar === src,
            })}
            onClick={() => onSelectAvatar(src)}
            aria-pressed={avatar === src}
            aria-label={t("Home.avatarOption", { index: i + 1 })}
            data-testid={`avatar-option-${i}`}>
            <Image
              src={src}
              alt={t("Home.avatarOption", { index: i + 1 })}
              width={120}
              height={120}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
