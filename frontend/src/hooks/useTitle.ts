import { useEffect, useState } from "react";

export default function useTitle({ title }: { title: string }) {
    const [_title, setTitle] = useState<string>(title);
    useEffect(() => {
        document.title = _title;
    }, [_title]);
    return setTitle;
}