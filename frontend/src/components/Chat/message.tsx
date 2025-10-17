import { useSession } from "next-auth/react";

import styles from "@/styles/Message.module.scss";
import classNames from "classnames";

type MessageType = {
  message: string;
  name: string | "system";
};

export default function Message({ message, name }: MessageType) {
  const { data } = useSession();
  const isMessageFromSystem = name === "system";
  const isMessageFromSameUser = data?.user?.name === name;
  const isMessageFromDifferentUser =
    data?.user?.name !== name && !isMessageFromSystem;

  return (
    <div
      key={`message-${message}`}
      className={classNames(
        styles.message,
        isMessageFromSameUser && styles.own,
        isMessageFromSystem && styles.system,
        isMessageFromDifferentUser && styles.other
      )}>
      <div className={styles.content}>
        <span className={styles.background}>{message}</span>
        {!isMessageFromSystem && (
          <span className={styles.fromName}>{name}</span>
        )}
      </div>
    </div>
  );
}
