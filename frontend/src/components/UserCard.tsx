import Image from "next/image";

import styles from "@styles/UserCard.module.scss";
import classNames from "classnames";
import UserPlaceholder from "./UserPlaceholder";

type UserCardProps = {
  user?: {
    id?: string;
    email: string;
    name: string;
    image?: string;
    status?: "READY" | "NOT_READY";
  };
  size?: "small" | "medium" | "large";
};
export default function UserCard({ user, size = "large" }: UserCardProps) {
  const isUserReady = user?.status === "READY";

  return (
    <div className={styles.UserCard}>
      <div
        className={classNames(
          styles.avatar,
          isUserReady ? styles.ready : styles.notReady,
          styles[size]
        )}>
        {user?.image ? (
          <Image
            alt="user.name"
            src={user.image}
            width={150}
            height={100}
          />
        ) : (
          <UserPlaceholder />
        )}
      </div>
      <div className={styles.description}>
        <span className={styles.title}>{user?.name}</span>
        <span className={styles.email}>{user?.email}</span>
      </div>
    </div>
  );
}
