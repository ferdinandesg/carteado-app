import { Search } from "lucide-react";
import styles from "@styles/Rooms.module.scss";

export default function SearchComponent() {
  return (
    <div className={styles.searchBox}>
      <input
        type="text"
        className={styles.searchInput}
      />
      <button className={styles.searchButton}>
        <Search />
      </button>
    </div>
  );
}
