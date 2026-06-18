"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import styles from "@/styles/GuestCustomizer.module.scss";
import classNames from "classnames";

import AvatarSection from "./AvatarSection";
import { SkinOption, skinOptions } from "./constants";
import GuestCustomizerActions from "./GuestCustomizerActions";
import GuestCustomizerHeader from "./GuestCustomizerHeader";
import ProfileSection from "./ProfileSection";
import SkinSection from "./SkinSection";

interface GuestCustomizerProps {
  onBack: () => void;
}
export default function GuestCustomizer({ onBack }: GuestCustomizerProps) {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [skin, setSkin] = useState<SkinOption>(skinOptions[0].value);
  const [isLoadingGuest, setIsLoadingGuest] = useState(false);
  const isNameValid = Boolean(name.trim());

  const handleGuestLogin = async () => {
    if (!isNameValid || isLoadingGuest) return;

    setIsLoadingGuest(true);
    try {
      await signIn("credentials", {
        username: name,
        avatar,
        skin,
        callbackUrl: "/menu",
      });
    } finally {
      setIsLoadingGuest(false);
    }
  };

  const handleResetCustomization = () => {
    setName("");
    setAvatar(null);
    setSkin(skinOptions[0].value);
  };

  return (
    <div
      className={classNames(
        styles.customizerContainer,
        "app-background",
        "font-big-shoulders"
      )}
      data-testid="guest-customizer-container">
      <div
        className={styles.customizerBox}
        data-testid="guest-customizer-box">
        <GuestCustomizerHeader onBack={onBack} />

        <section className={styles.content}>
          <ProfileSection
            name={name}
            avatar={avatar}
            onChangeName={setName}
          />

          <AvatarSection
            avatar={avatar}
            onSelectAvatar={setAvatar}
          />

          <SkinSection
            skin={skin}
            onSelectSkin={setSkin}
          />
        </section>

        <GuestCustomizerActions
          canApply={isNameValid}
          isLoading={isLoadingGuest}
          onReset={handleResetCustomization}
          onApply={handleGuestLogin}
        />
      </div>
    </div>
  );
}
