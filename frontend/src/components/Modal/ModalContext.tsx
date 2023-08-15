import { ReactNode, createContext, useContext, useState } from "react";

type ModalProps = {
  show: boolean;
  setShowModal: (show: boolean) => void;
};

const defaultModalProps: ModalProps = {
  show: false,
  setShowModal: () => {},
};
const ModalContext = createContext(defaultModalProps);
export function ModalProvider({ children }: { children: ReactNode }) {
  const [show, setShowModal] = useState<boolean>(true);
  return (
    <ModalContext.Provider value={{ show, setShowModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export default function useModalContext() {
  const context = useContext(ModalContext);
  if (!context)
    throw new Error(
      "useModalContext must be used within a ModalContextProvider"
    );
  return context;
}
