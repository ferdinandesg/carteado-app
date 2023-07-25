import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Link href={"/game"}>
        <button className="bg-gray-300 hover:bg-gray-500 transition p-2">
          Start Game
        </button>
      </Link>
    </div>
  );
}
