import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateRoomPage from "./page";
import usePostRoom from "@/hooks/rooms/usePostRoom";

jest.mock("@/components/buttons/withSound", () => ({
  withSound: (Component: React.ComponentType<any>) => (props: any) => (
    <Component {...props} />
  ),
}));

// Mock do Next.js router para simular a navegação
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(), // A função que será chamada para redirecionar
  }),
}));

// Mock do hook de criação de sala
jest.mock("@/hooks/rooms/usePostRoom", () => jest.fn());

describe("CreateRoomPage", () => {
  it("deve permitir que o usuário preencha o formulário e crie uma sala", async () => {
    const user = userEvent.setup();
    const mockMutate = jest.fn();
    (usePostRoom as jest.Mock).mockReturnValue({
      createRoom: mockMutate,
      isPending: false,
    });
    mockMutate.mockResolvedValue({ hash: "abc1" });

    render(<CreateRoomPage />);

    const nameInput = screen.getByTestId("room-name-input");
    const sizeButton = screen.getByTestId("room-size-button-4");
    const ruleButton = screen.getByTestId("room-rule-button-CarteadoGameRules");
    const createButton = screen.getByTestId("create-room-button");
    expect(createButton).toBeDisabled();

    // Preenche o nome da sala
    await user.type(nameInput, "Minha Sala");
    expect(nameInput).toHaveValue("Minha Sala");
    expect(createButton).toBeEnabled();
    // Seleciona o tamanho da sala
    await user.click(sizeButton);
    expect(sizeButton).toHaveClass("selected");
    // Seleciona a regra do jogo
    await user.click(ruleButton);
    expect(ruleButton).toHaveClass("selected");

    // Clica no botão para criar a sala
    await user.click(createButton);
  });
});
