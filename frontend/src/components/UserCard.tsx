import Image from "next/image";

import styles from "@styles/UserCard.module.scss";
import classNames from "classnames";
import UserPlaceholder from "./UserPlaceholder";
import RankMeter from "./RankMeter";

type UserCardProps = {
  user?: {
    id?: string;
    email: string;
    name: string;
    image?: string;
    status?: "READY" | "NOT_READY";
    rank?: number;
  };
  size?: "small" | "medium" | "large";
};

export default function UserCard({ user, size = "large" }: UserCardProps) {
  const isUserReady = user?.status === "READY";
  const userRank = user?.rank || 0;

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
        <h2 className={styles.title}>{user?.name}</h2>
        <span>Rank:</span>
        <RankMeter
          currentValue={userRank}
          maxValue={15}
        />
      </div>
    </div>
  );
}
