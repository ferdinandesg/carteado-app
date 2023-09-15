import Image from "next/image";
import { useSession } from "next-auth/react";
type UserCardProps = {
  user: {
    id?: string;
    email: string;
    name: string;
    image: string;
  };
}
export default function UserCard({ user }: UserCardProps) {
  // const { data, status } = useSession();
  // const user = data?.user;

  return (
    <div className="flex w-1/2 p-2 rounded">
      <div className="">
        {user?.image &&
          <Image alt="user.name" src={user.image} width={90} height={90} />
        }
      </div>
      <div className="flex flex-col ml-2">
        <span className="text-gray-300 font-semibold text-sm">{user?.name}</span>
        <span className="text-gray-300 text-sm">{user?.email}</span>
      </div>
    </div>
  );
}
