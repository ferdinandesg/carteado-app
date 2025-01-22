import { X } from "lucide-react";
import { HtmlHTMLAttributes } from "react";

interface HeaderProps extends HtmlHTMLAttributes<HTMLDivElement> {
  title: string;
  onClose?: () => void;
}
export default function Header({ ...props }: HeaderProps) {
  return (
    <div className="h-16 flex bg-gray-300 p-2 items-center justify-between rounded-t-xl">
      <span className="font-bold text-lg text-gray-800">{props.title}</span>
      {props.onClose && (
        <button
          className="hover:bg-gray-400 transition rounded-lg p-1 hover:text-white"
          onClick={props.onClose}>
          <X />
        </button>
      )}
    </div>
  );
}
