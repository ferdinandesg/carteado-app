"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

import ActionButton from "@/components/buttons/ActionButton";
import RankMeter from "@/components/RankMeter";
import styles from "@/styles/Menu.module.scss";
import UserPlaceholder from "@/components/UserPlaceholder";
import {
  Coins,
  History,
  List,
  ListPlus,
  Pencil,
  Play,
  Search,
  Settings,
  ShoppingBag,
  Star,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import useTitle from "@/hooks/useTitle";

const playerLevel = 22;
const playerXp = 68;
const playerGold = "00000";

export default function Menu() {
  const { t } = useTranslation();
  useTitle({ title: t("pageTitles.menu") });

  const router = useRouter();
  const { data } = useSession();
  const user = data?.user;
  const userName = user?.name || "Player 0101";
  const userRank = user?.rank || 12;
  const friends = [
    { name: userName, status: t("Menu.online"), image: user?.image },
    { name: "Player 0101", status: t("Menu.offline") },
  ];

  return (
    <main className={styles.Menu}>
      <aside
        className={styles.sidebar}
        aria-label={userName}>
        <div className={styles.profileAvatar}>
          {user?.image ? (
            <Image
              src={user.image}
              alt={userName}
              width={112}
              height={112}
            />
          ) : (
            <UserPlaceholder />
          )}
        </div>

        <div className={styles.profileName}>
          <h1>{userName}</h1>
          <Pencil
            size={24}
            aria-hidden
          />
        </div>

        <span className={styles.levelBadge}>
          {t("Menu.level", { level: playerLevel })}
        </span>

        <RankMeter
          currentValue={userRank}
          size={34}
        />

        <button
          type="button"
          className={styles.statsButton}>
          {">"} {t("Menu.statistics")}
        </button>

        <button
          type="button"
          className={styles.helpButton}
          aria-label={t("seeRules")}
          onClick={() => router.push("/rules")}>
          ?
        </button>
      </aside>

      <section className={styles.mainPanel}>
        <header className={styles.topBar}>
          <div className={styles.xpWidget}>
            <span className={styles.hexBadge}>{playerLevel}</span>
            <div
              className={styles.xpTrack}
              aria-label={`${t("Menu.xp")} ${playerXp}%`}>
              <span style={{ width: `${playerXp}%` }} />
            </div>
          </div>

          <div className={styles.wallet}>
            <Coins
              size={28}
              aria-hidden
            />
            <strong>{playerGold}</strong>
            <button
              type="button"
              aria-label={t("Menu.gold")}>
              +
            </button>
          </div>

          <button
            type="button"
            className={styles.shopButton}>
            <ShoppingBag
              size={22}
              aria-hidden
            />
            {t("Menu.shop")}
          </button>

          <button
            type="button"
            className={styles.settingsButton}
            aria-label="Settings">
            <Settings
              size={30}
              aria-hidden
            />
          </button>
        </header>

        <div className={styles.gameplayCard}>
          <div className={styles.cardTabs}>
            <span>{t("Menu.gameplay")}</span>
            <span aria-hidden />
            <span aria-hidden />
          </div>

          <div className={styles.menuActions}>
            <ActionButton
              type="button"
              className={styles.menuAction}
              variant="primary"
              size="lg"
              icon={<Play size={28} />}
              onClick={() => router.push(`/rooms`)}>
              {t("Menu.play")}
            </ActionButton>
            <ActionButton
              type="button"
              className={styles.menuAction}
              variant="secondary"
              size="lg"
              icon={<ListPlus size={28} />}
              onClick={() => router.push(`/room/create`)}>
              {t("Menu.createRoom")}
            </ActionButton>
            <ActionButton
              type="button"
              className={styles.menuAction}
              variant="accent"
              size="lg"
              icon={<List size={28} />}
              onClick={() => router.push(`/rooms`)}>
              {t("Menu.createdRooms")}
            </ActionButton>
          </div>
        </div>

        <div className={styles.panelFooter}>
          <span>{t("Menu.version")}</span>
          <button type="button">
            <History
              size={20}
              aria-hidden
            />
            {t("Menu.history")}
          </button>
        </div>
      </section>

      <aside
        className={styles.friendsPanel}
        aria-labelledby="friends-title">
        <h2 id="friends-title">
          <Users
            size={22}
            aria-hidden
          />
          {t("Menu.friends")}
        </h2>

        <label className={styles.searchBox}>
          <Search
            size={18}
            aria-hidden
          />
          <input
            type="search"
            placeholder={t("Menu.searchFriends")}
          />
        </label>

        <ul className={styles.friendsList}>
          {friends.map((friend) => (
            <li key={`${friend.name}-${friend.status}`}>
              <div className={styles.friendAvatar}>
                {friend.image ? (
                  <Image
                    src={friend.image}
                    alt=""
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
              <div>
                <strong>{friend.name}</strong>
                <span>{friend.status}</span>
              </div>
            </li>
          ))}
        </ul>
      </aside>
    </main>
  );
}
