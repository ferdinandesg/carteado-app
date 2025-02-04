import Home from "@/app/page";
import { screen } from "@testing-library/dom";
import { renderWithProviders } from "@tests/utils"

test("renders home page", () => {
    const { getByText } = renderWithProviders(<Home />);
    screen.logTestingPlaygroundURL();;
});