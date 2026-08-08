import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FriendsPanel from "@/components/menu/FriendsPanel";
import useFriends, { useIsRegisteredUser } from "@/hooks/friends/useFriends";
import useFriendRequests from "@/hooks/friends/useFriendRequests";
import useSearchUsers from "@/hooks/friends/useSearchUsers";
import useFriendActions from "@/hooks/friends/useFriendActions";
import { testIds } from "@/tests/testIds";

jest.mock("@/hooks/friends/useFriends", () => ({
  __esModule: true,
  default: jest.fn(),
  useIsRegisteredUser: jest.fn(),
  useFriendsQueryEnabled: jest.fn(() => true),
}));
jest.mock("@/hooks/friends/useFriendRequests", () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock("@/hooks/friends/useSearchUsers", () => ({
  __esModule: true,
  default: jest.fn(),
  MIN_SEARCH_LENGTH: 2,
}));
jest.mock("@/hooks/friends/useFriendActions", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockUseFriends = useFriends as jest.Mock;
const mockUseIsRegisteredUser = useIsRegisteredUser as jest.Mock;
const mockUseFriendRequests = useFriendRequests as jest.Mock;
const mockUseSearchUsers = useSearchUsers as jest.Mock;
const mockUseFriendActions = useFriendActions as jest.Mock;

const friendUser = { id: "u2", name: "Alice", image: "", rank: 42 };
const requesterUser = { id: "u3", name: "Bob", image: "", rank: 10 };

function mockActions() {
  const actions = {
    sendRequest: { mutate: jest.fn(), isPending: false },
    acceptRequest: { mutate: jest.fn(), isPending: false },
    dismissRequest: { mutate: jest.fn(), isPending: false },
    removeFriend: { mutate: jest.fn(), isPending: false },
  };
  mockUseFriendActions.mockReturnValue(actions);
  return actions;
}

function setup({
  isRegistered = true,
  friends = [] as unknown[],
  incoming = [] as unknown[],
  results = [] as unknown[],
} = {}) {
  mockUseIsRegisteredUser.mockReturnValue(isRegistered);
  mockUseFriends.mockReturnValue({ friends, isLoading: false, isError: false });
  mockUseFriendRequests.mockReturnValue({
    requests: { incoming, outgoing: [] },
    isLoading: false,
    isError: false,
  });
  mockUseSearchUsers.mockReturnValue({ results, isSearching: false });
  const actions = mockActions();
  render(
    <FriendsPanel
      title="Meus amigos"
      searchPlaceholder="Pesquisar"
    />
  );
  return actions;
}

describe("FriendsPanel", () => {
  beforeEach(() => jest.clearAllMocks());

  it("pede login para convidados", () => {
    setup({ isRegistered: false });
    expect(screen.getByText("Menu.friendsLoginRequired")).toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("lista amigos e permite remover", async () => {
    const actions = setup({
      friends: [{ friendshipId: "f1", since: null, user: friendUser }],
    });

    expect(screen.getByText("Alice")).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Menu.removeFriend" })
    );
    expect(actions.removeFriend.mutate).toHaveBeenCalledWith("u2");
  });

  it("mostra convites recebidos com aceitar e recusar", async () => {
    const actions = setup({
      incoming: [
        { friendshipId: "f9", createdAt: "2026-01-01", user: requesterUser },
      ],
    });

    expect(screen.getByTestId(testIds.menu.friendRequests)).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Menu.acceptRequest" })
    );
    expect(actions.acceptRequest.mutate).toHaveBeenCalledWith("f9");

    await userEvent.click(
      screen.getByRole("button", { name: "Menu.declineRequest" })
    );
    expect(actions.dismissRequest.mutate).toHaveBeenCalledWith("f9");
  });

  it("busca usuários e envia convite", async () => {
    const actions = setup({
      results: [{ ...requesterUser, relation: "NONE" }],
    });

    await userEvent.type(screen.getByRole("searchbox"), "Bo");

    expect(
      screen.getByTestId(testIds.menu.friendSearchResults)
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Menu.addFriend" })
    );
    expect(actions.sendRequest.mutate).toHaveBeenCalledWith("u3");
  });

  it("não oferece convite para quem já tem relação", async () => {
    setup({ results: [{ ...requesterUser, relation: "PENDING" }] });

    await userEvent.type(screen.getByRole("searchbox"), "Bo");

    expect(
      screen.queryByTestId(testIds.menu.friendSearchResults)
    ).not.toBeInTheDocument();
  });
});
