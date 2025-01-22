import { User } from "lucide-react";

import styles from "@styles/UserCard.module.scss";

export default function UserPlaceholder() {
  return (
    <div className={styles.placeholderAvatar}>
      <User size={42} />
    </div>
  );
}
