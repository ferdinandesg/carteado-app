import { User2 } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function UserCard() {
  const { data, status } = useSession();
  const user = data?.user;
  return (
    <div className="flex w-1/2 p-2 rounded">
      <div className="">
        {user?.image ? (
          <Image alt="user.name" src={user?.image} width={90} height={90} />
        ) : (
          <div className="bg-gray-500">
            <User2 width={90} height={90} color="#c5c5c5" />
          </div>
        )}
      </div>
      <div className="flex flex-col ml-2">
        <span className="text-gray-300 font-semibold text-sm">{user?.name || "Convidado"}</span>
        <span className="text-gray-300 text-sm">{user?.email || "Sem e-mail"}</span>
      </div>
    </div>
  );
}
