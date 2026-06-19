import { Search } from "lucide-react";
import styles from "@/styles/Rooms.module.scss";

type SearchComponentProps = {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
};

export default function SearchComponent({
  value = "",
  placeholder,
  onChange,
}: SearchComponentProps) {
  return (
    <label className={styles.searchBox}>
      <input
        type="search"
        className={styles.searchInput}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
      />
      <Search
        size={24}
        aria-hidden
      />
    </label>
  );
}
