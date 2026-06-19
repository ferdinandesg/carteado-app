"use client";

import Image from "next/image";
import { Search, Star, Users } from "lucide-react";

import styles from "@/styles/Menu.module.scss";
import classNames from "classnames";

export type MenuFriend = {
  name: string;
  status: "online" | "offline";
  image?: string | null;
};

type FriendsPanelProps = {
  friends: MenuFriend[];
  title: string;
  searchPlaceholder: string;
};

export default function FriendsPanel({
  friends,
  title,
  searchPlaceholder,
}: FriendsPanelProps) {
  console.log({
    friends,
  });
  return (
    <aside
      className={styles.friendsPanel}
      aria-labelledby="friends-title">
      <h2 id="friends-title">
        <Users
          size={22}
          aria-hidden
        />
        {title}
      </h2>

      <label className={styles.searchBox}>
        <Search
          size={18}
          aria-hidden
        />
        <input
          type="search"
          placeholder={searchPlaceholder}
        />
      </label>

      <ul className={styles.friendsList}>
        {friends.map((friend) => (
          <li key={`${friend.name}-${friend.status}`}>
            <div
              className={classNames(
                styles.friendAvatar,
                styles[friend.status.toLowerCase()]
              )}>
              {friend.image ? (
                <Image
                  src={friend.image}
                  alt={friend.name}
                  width={52}
                  height={52}
                />
              ) : (
                <Star
                  size={28}
                  aria-hidden
                />
              )}
            </div>
            <div className={styles.friendName}>
              <strong>{friend.name}</strong>
              <span
                className={classNames(
                  styles.friendStatus,
                  styles[friend.status.toLowerCase()]
                )}>
                {friend.status}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
