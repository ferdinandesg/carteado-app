import { Search } from "lucide-react";
import TextInput from "@/components/inputs/TextInput";

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
    <TextInput
      type="search"
      value={value}
      placeholder={placeholder}
      aria-label={placeholder}
      icon={
        <Search
          size={24}
          aria-hidden
        />
      }
      iconPosition="right"
      onChange={(event) => onChange?.(event.target.value)}
    />
  );
}
