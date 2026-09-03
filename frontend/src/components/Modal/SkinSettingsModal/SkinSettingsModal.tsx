"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import classNames from "classnames";
import Image from "next/image";
import { useTranslation } from "react-i18next";

import Modal from "@/components/Modal";
import ActionButton from "@/components/buttons/ActionButton";
import {
  skinOptions,
  SkinOption,
} from "@/components/GuestCustomizer/constants";

import styles from "@styles/SkinSettingsModal.module.scss";

interface SkinSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SkinSettingsModal({
  isOpen,
  onClose,
}: SkinSettingsModalProps) {
  const { t } = useTranslation();
  const { data: session, update } = useSession();
  const currentSkin = (session?.user?.skin || "baralho01") as SkinOption;
  const [selected, setSelected] = useState<SkinOption>(currentSkin);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (selected === currentSkin) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      await update({ skin: selected });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal.Root className={styles.panel}>
      <Modal.Header
        title={t("Settings.chooseSkin", {
          defaultValue: "Escolha seu baralho",
        })}
        onClose={onClose}
      />
      <Modal.Content className={styles.content}>
        <div
          className={styles.skinGrid}
          role="radiogroup"
          aria-label={t("Settings.chooseSkin", {
            defaultValue: "Escolha seu baralho",
          })}>
          {skinOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected === option.value}
              className={classNames(styles.skinOption, {
                [styles.selected]: selected === option.value,
              })}
              onClick={() => setSelected(option.value)}>
              <Image
                src={option.path}
                alt={option.name}
                width={92}
                height={138}
                className={styles.skinImage}
              />
              <span className={styles.skinName}>{option.name}</span>
            </button>
          ))}
        </div>
      </Modal.Content>
      <Modal.Footer>
        <ActionButton
          type="button"
          variant="secondary"
          size="sm"
          onClick={onClose}>
          {t("cancel", { defaultValue: "Cancelar" })}
        </ActionButton>
        <ActionButton
          type="button"
          variant="primary"
          size="sm"
          disabled={saving}
          onClick={handleConfirm}>
          {saving
            ? t("saving", { defaultValue: "Salvando..." })
            : t("confirm", { defaultValue: "Confirmar" })}
        </ActionButton>
      </Modal.Footer>
    </Modal.Root>
  );
}
