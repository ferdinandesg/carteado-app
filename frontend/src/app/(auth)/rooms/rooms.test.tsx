import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoomsPage from './page';
import useFetchRooms from '@/hooks/rooms/useFetchRooms';
import { useRouter } from 'next/navigation';

// Mock dos hooks e do router
jest.mock('@/hooks/rooms/useFetchRooms');

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));
// eslint-disable-next-line react/display-name
jest.mock('@/components/Search', () => () => <input placeholder="procurar sala" />);

const mockRooms = [
    { id: '1', hash: "AABB", name: 'Sala dos Campeões', players: 1, hasPassword: true, participants: [] },
    { id: '2', hash: "CCCC", name: 'Apenas Novatos', players: 2, hasPassword: false, participants: [] },
    { id: '3', hash: "DDDD", name: 'Sala de Teste', players: 0, hasPassword: false, participants: [] },
];
jest.mock("@/components/buttons/withSound", () => ({
    withSound: (Component: React.ComponentType<any>) => (props: any) =>
        <Component {...props} />,
}));
describe('RoomsPage', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        // Configura o retorno padrão dos mocks para cada teste
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        (useFetchRooms as jest.Mock).mockReturnValue({
            data: mockRooms,
            isLoading: false,
        });
    });

    afterEach(() => {
        jest.clearAllMocks(); // Limpa os mocks após cada teste
    });

    it('deve renderizar a lista de salas corretamente', () => {
        render(<RoomsPage />);
        screen.logTestingPlaygroundURL();
        // Verifica se os elementos principais estão na tela
        expect(screen.getByTestId('back-button')).toBeInTheDocument();
        // Verifica se os itens da sala foram renderizados

        const roomList = screen.getByTestId('room-list');
        expect(roomList).toBeInTheDocument();
        expect(roomList.children).toHaveLength(mockRooms.length);

        mockRooms.forEach((room) => {
            expect(screen.getByText(room.name)).toBeInTheDocument();
        });
    });

    it('deve voltar ao menu ao clicar no botão de voltar', async () => {
        const user = userEvent.setup();
        render(<RoomsPage />);

        const backButton = screen.getByTestId('back-button');
        await user.click(backButton);

        // Verifica se o router foi chamado para a rota correta
        expect(mockPush).toHaveBeenCalledWith('/menu');
        expect(mockPush).toHaveBeenCalledTimes(1); // Garante que foi chamado apenas uma vez
    });

    it.skip('deve filtrar as salas quando o usuário digita na busca', async () => {
        const user = userEvent.setup();
        render(<RoomsPage />);

        const searchInput = screen.getByPlaceholderText(/procurar sala/i);
        await user.type(searchInput, 'Novatos');

        // Após filtrar, apenas a sala "Apenas Novatos" deve estar visível
        expect(screen.queryByText('Sala dos Campeões')).not.toBeInTheDocument();
        expect(screen.getByText('Apenas Novatos')).toBeInTheDocument();
    });

    it.skip('deve navegar para a página de criação de sala ao clicar no botão', async () => {
        const user = userEvent.setup();
        render(<RoomsPage />);

        const createButton = screen.getByRole('button', { name: /criar sala/i });
        await user.click(createButton);

        // Verifica se o router foi chamado para a rota correta
        expect(mockPush).toHaveBeenCalledWith('/room/create');
    });
});