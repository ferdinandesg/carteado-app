"use client";

import { ReactNode } from "react";
import classNames from "classnames";
import { Info, MessageCircle, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";

import {
  RoomPanel,
  RoomShellProvider,
  useRoomShell,
} from "@/contexts/roomShell.context";
import styles from "@/styles/Room.module.scss";
import { testIds } from "@/tests/testIds";

type RoomShellProps = {
  participants: ReactNode;
  info: ReactNode;
  chat?: ReactNode;
  children: ReactNode;
};

/**
 * Desktop: 3 colunas (participantes | mesa | info + chat).
 * Mobile: participantes no topo, mesa ocupa o resto e info/chat abrem
 * como bottom sheet a partir de uma barra inferior.
 */
export default function RoomShell(props: RoomShellProps) {
  return (
    <RoomShellProvider>
      <RoomShellLayout {...props} />
    </RoomShellProvider>
  );
}

function RoomShellLayout({
  participants,
  info,
  chat,
  children,
}: RoomShellProps) {
  const shell = useRoomShell()!;

  return (
    <main
      className={classNames(styles.roomShell, {
        [styles.mobile]: shell.isMobile,
      })}>
      <div className={classNames(styles.roomSidePanel, styles.participants)}>
        {participants}
      </div>

      <section className={styles.roomStage}>{children}</section>

      {shell.isMobile ? (
        <>
          <MobileBar />
          <MobileSheet
            info={info}
            chat={chat}
          />
        </>
      ) : (
        <div className={classNames(styles.roomSidePanel, styles.aside)}>
          <div className={styles.asideInfo}>{info}</div>
          {chat && <div className={styles.asideChat}>{chat}</div>}
        </div>
      )}
    </main>
  );
}

function MobileBar() {
  const { t } = useTranslation();
  const { activePanel, openPanel, chatUnread } = useRoomShell()!;

  const tab = (panel: RoomPanel, icon: ReactNode, label: string) => (
    <button
      type="button"
      className={classNames(styles.barButton, {
        [styles.active]: activePanel === panel,
      })}
      aria-pressed={activePanel === panel}
      data-testid={testIds.room.panelToggle(panel)}
      onClick={() => openPanel(panel)}>
      {icon}
      <span>{label}</span>
      {panel === "chat" && chatUnread > 0 && (
        <span
          className={styles.unreadBadge}
          data-testid={testIds.room.chatUnread}>
          {chatUnread > 9 ? "9+" : chatUnread}
        </span>
      )}
    </button>
  );

  return (
    <nav
      className={styles.mobileBar}
      aria-label={t("RoomShell.panels")}>
      {tab("chat", <MessageCircle size={20} />, t("RoomShell.chat"))}
      {tab("info", <Info size={20} />, t("RoomShell.info"))}
    </nav>
  );
}

function MobileSheet({ info, chat }: Pick<RoomShellProps, "info" | "chat">) {
  const { t } = useTranslation();
  const { activePanel, closePanel } = useRoomShell()!;
  const reduced = useReducedMotion();

  const isOpen = activePanel !== null;

  // O sheet fica sempre montado (só translada) para o Chat manter o socket,
  // o histórico e a contagem de não lidas mesmo fechado.
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.button
            type="button"
            aria-label={t("RoomShell.close")}
            className={styles.sheetBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePanel}
          />
        )}
      </AnimatePresence>
      <motion.section
        role="dialog"
        aria-modal={isOpen}
        aria-hidden={!isOpen}
        aria-label={activePanel ? t(`RoomShell.${activePanel}`) : undefined}
        className={classNames(styles.sheet, { [styles.open]: isOpen })}
        data-testid={testIds.room.sheet}
        data-open={isOpen}
        initial={false}
        animate={{ y: isOpen ? 0 : "100%" }}
        transition={
          reduced
            ? { duration: 0 }
            : { type: "spring", stiffness: 380, damping: 36 }
        }>
        <header className={styles.sheetHeader}>
          <span className={styles.sheetHandle} />
          <button
            type="button"
            className={styles.sheetClose}
            aria-label={t("RoomShell.close")}
            data-testid={testIds.room.sheetClose}
            tabIndex={isOpen ? 0 : -1}
            onClick={closePanel}>
            <X size={20} />
          </button>
        </header>
        <div className={styles.sheetBody}>
          <div hidden={activePanel !== "info"}>{info}</div>
          <div
            className={styles.sheetChat}
            hidden={activePanel !== "chat"}>
            {chat}
          </div>
        </div>
      </motion.section>
    </>
  );
}
