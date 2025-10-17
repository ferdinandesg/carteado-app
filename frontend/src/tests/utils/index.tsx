import { ReactNode } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { SocketProvider } from "@/contexts/socket.context"; // Verifique a importação
import { SessionProvider } from "next-auth/react";  // Verifique se está importando corretamente
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { ModalProvider } from "@/components/Modal/ModalContext";
import { ToastContainer } from "react-toastify";
import i18n from "i18next";

// Criando instância do QueryClient
const queryClient = new QueryClient();

const AllProviders = ({ children }: { children: ReactNode }) => {
  return (
    <I18nextProvider i18n={i18n}>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <SocketProvider>
            <ModalProvider>{children}</ModalProvider>
          </SocketProvider>
          <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss={false}
            draggable={false}
            pauseOnHover={false}
            theme="light"
          />
        </QueryClientProvider>
      </SessionProvider>
    </I18nextProvider>
  );
};

// Custom render function
const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllProviders, ...options });

export { customRender as renderWithProviders };
