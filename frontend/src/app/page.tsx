"use client";
import Link from "next/link";
import { signIn,  } from "next-auth/react";
export default function Home() {  
  return (
    <div className="bg-gradient-to-r from-green-800 via-green-700 to-green-800  h-screen w-screen flex items-center justify-center">
      <div className="w-1/3 h-1/3 bg-gray- 00 flex flex-col p-2 justify-around items-center">
        <h1 className="font-bold text-4xl">Carteado</h1>
        <button className="bg-white p-2 rounded" onClick={() => signIn("google")}>Login google</button>
        <Link href={"/room"}>
          <button className="bg-gray-500 text-white hover:bg-gray-500 transition p-2">
            Start Game
          </button>
        </Link>
      </div>
    </div>
  );
}
