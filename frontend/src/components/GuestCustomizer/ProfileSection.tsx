import Image from "next/image";
import { useTranslation } from "react-i18next";

import TextInput from "@/components/inputs/TextInput";
import styles from "@/styles/GuestCustomizer.module.scss";

import { DEFAULT_AVATAR } from "./constants";

interface ProfileSectionProps {
  name: string;
  avatar: string | null;
  onChangeName: (name: string) => void;
}

export default function ProfileSection({
  name,
  avatar,
  onChangeName,
}: ProfileSectionProps) {
  const { t } = useTranslation();

  return (
    <section
      className={styles.profileSection}
      aria-label={t("Home.guestNickname")}>
      <div className={styles.selectedAvatar}>
        <Image
          src={avatar || DEFAULT_AVATAR}
          alt={t("Home.selectedAvatar")}
          width={150}
          height={150}
          className={styles.selectedAvatarImage}
        />
      </div>

      <div className={styles.nicknameField}>
        <TextInput
          type="text"
          data-testid="guest-name-input"
          id="guestname"
          placeholder={t("Home.guestNicknamePlaceholder")}
          aria-label={t("Home.guestNickname")}
          autoComplete="nickname"
          inputSize="lg"
          value={name}
          onChange={(event) => onChangeName(event.target.value)}
        />
      </div>
    </section>
  );
}
