"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import {
  Check,
  Search,
  Star,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import styles from "@/styles/Menu.module.scss";
import classNames from "classnames";
import TextInput from "@/components/inputs/TextInput";
import { testIds } from "@/tests/testIds";
import { FriendUser } from "shared/types";
import useFriends, { useIsRegisteredUser } from "@/hooks/friends/useFriends";
import useFriendRequests from "@/hooks/friends/useFriendRequests";
import useSearchUsers, {
  MIN_SEARCH_LENGTH,
} from "@/hooks/friends/useSearchUsers";
import useFriendActions from "@/hooks/friends/useFriendActions";

type FriendsPanelProps = {
  title: string;
  searchPlaceholder: string;
};

function FriendAvatar({ user }: { user: FriendUser }) {
  return (
    <div className={styles.friendAvatar}>
      {user.image ? (
        <Image
          src={user.image}
          alt={user.name}
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
  );
}

export default function FriendsPanel({
  title,
  searchPlaceholder,
}: FriendsPanelProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const isRegistered = useIsRegisteredUser();
  const { friends } = useFriends();
  const { requests } = useFriendRequests();
  const { results } = useSearchUsers(query);
  const { sendRequest, acceptRequest, dismissRequest, removeFriend } =
    useFriendActions();

  const normalizedQuery = query.trim().toLowerCase();
  const filteredFriends = normalizedQuery
    ? friends.filter((friend) =>
        friend.user.name.toLowerCase().includes(normalizedQuery)
      )
    : friends;
  const isSearching = normalizedQuery.length >= MIN_SEARCH_LENGTH;
  const searchResults = results.filter((user) => user.relation === "NONE");

  return (
    <aside
      id="menu-friends-panel"
      className={styles.friendsPanel}
      data-testid={testIds.menu.friendsPanel}
      aria-labelledby="friends-title">
      <h2 id="friends-title">
        <Users
          size={22}
          aria-hidden
        />
        {title}
      </h2>

      {!isRegistered ? (
        <p className={styles.friendsHint}>{t("Menu.friendsLoginRequired")}</p>
      ) : (
        <>
          <TextInput
            type="search"
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            icon={
              <Search
                size={18}
                aria-hidden
              />
            }
          />

          {isSearching && searchResults.length > 0 && (
            <section aria-label={t("Menu.searchResults")}>
              <h3 className={styles.friendsSectionTitle}>
                {t("Menu.searchResults")}
              </h3>
              <ul
                className={styles.friendsList}
                data-testid={testIds.menu.friendSearchResults}>
                {searchResults.map((user) => (
                  <li key={user.id}>
                    <FriendAvatar user={user} />
                    <div className={styles.friendName}>
                      <strong>{user.name}</strong>
                      <span>{t("Menu.friendRank", { rank: user.rank })}</span>
                    </div>
                    <div className={styles.friendActions}>
                      <button
                        type="button"
                        aria-label={t("Menu.addFriend")}
                        disabled={sendRequest.isPending}
                        onClick={() => sendRequest.mutate(user.id)}>
                        <UserPlus size={18} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {requests.incoming.length > 0 && (
            <section aria-label={t("Menu.friendRequests")}>
              <h3 className={styles.friendsSectionTitle}>
                {t("Menu.friendRequests")}
              </h3>
              <ul
                className={styles.friendsList}
                data-testid={testIds.menu.friendRequests}>
                {requests.incoming.map((request) => (
                  <li key={request.friendshipId}>
                    <FriendAvatar user={request.user} />
                    <div className={styles.friendName}>
                      <strong>{request.user.name}</strong>
                      <span>
                        {t("Menu.friendRank", { rank: request.user.rank })}
                      </span>
                    </div>
                    <div className={styles.friendActions}>
                      <button
                        type="button"
                        aria-label={t("Menu.acceptRequest")}
                        disabled={acceptRequest.isPending}
                        onClick={() =>
                          acceptRequest.mutate(request.friendshipId)
                        }>
                        <Check size={18} />
                      </button>
                      <button
                        type="button"
                        aria-label={t("Menu.declineRequest")}
                        disabled={dismissRequest.isPending}
                        onClick={() =>
                          dismissRequest.mutate(request.friendshipId)
                        }>
                        <X size={18} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {requests.outgoing.length > 0 && (
            <section aria-label={t("Menu.sentRequests")}>
              <h3 className={styles.friendsSectionTitle}>
                {t("Menu.sentRequests")}
              </h3>
              <ul className={styles.friendsList}>
                {requests.outgoing.map((request) => (
                  <li key={request.friendshipId}>
                    <FriendAvatar user={request.user} />
                    <div className={styles.friendName}>
                      <strong>{request.user.name}</strong>
                      <span>{t("Menu.pendingRequest")}</span>
                    </div>
                    <div className={styles.friendActions}>
                      <button
                        type="button"
                        aria-label={t("Menu.cancelRequest")}
                        disabled={dismissRequest.isPending}
                        onClick={() =>
                          dismissRequest.mutate(request.friendshipId)
                        }>
                        <X size={18} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <ul
            className={styles.friendsList}
            data-testid={testIds.menu.friendsList}>
            {filteredFriends.length === 0 && !isSearching && (
              <li className={styles.friendsHint}>{t("Menu.noFriends")}</li>
            )}
            {filteredFriends.map((friend) => (
              <li key={friend.friendshipId}>
                <FriendAvatar user={friend.user} />
                <div className={styles.friendName}>
                  <strong>{friend.user.name}</strong>
                  <span>
                    {t("Menu.friendRank", { rank: friend.user.rank })}
                  </span>
                </div>
                <div className={styles.friendActions}>
                  <button
                    type="button"
                    aria-label={t("Menu.removeFriend")}
                    disabled={removeFriend.isPending}
                    onClick={() => removeFriend.mutate(friend.user.id)}>
                    <UserMinus size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </aside>
  );
}
