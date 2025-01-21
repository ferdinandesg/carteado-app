import Image from "next/image";

import styles from "@styles/UserCard.module.scss";
import { User } from "lucide-react";
import classNames from "classnames";

type UserCardProps = {
  user: {
    id?: string;
    email: string;
    name: string;
    image: string;
    status?: "READY" | "NOT_READY";
  };
}
export default function UserCard({ user }: UserCardProps) {
  const isUserReady = user.status === "READY";

  return (
    <div className={styles.UserCard}>
      <div className={classNames(styles.avatar,
        isUserReady ? styles.ready : styles.notReady
      )}>
        {
          user?.image
            ? <Image alt="user.name" src={user.image} width={42} height={42} />
            : <div className={styles.placeholderAvatar}>
              <User size={42} />
            </div>
        }
      </div>
      <div className={styles.description}>
        <span className={styles.title}>{user?.name}</span>
        <span className={styles.email}>{user?.email}</span>
      </div>
    </div>
  );
}
