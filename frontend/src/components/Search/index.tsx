import { Search } from "lucide-react";

export default function SearchComponent() {

    return <div className="flex">
        <input type="text" />
        <button className="border p-2">
            <Search />
        </button>
    </div>
}