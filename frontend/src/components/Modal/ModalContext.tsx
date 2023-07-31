import { ReactNode, createContext, useState } from "react";

type ModalProps = {
  show: boolean;
  setShowModal: (show: boolean) => void;
};

const defaultModalProps: ModalProps = {
  show: false,
  setShowModal: () => {},
};
export const ModalContext = createContext(defaultModalProps);
export function ModalProvider({ children }: { children: ReactNode }) {
  const [show, setShowModal] = useState<boolean>(true);
  return (
    <ModalContext.Provider value={{ show, setShowModal }}>
      {children}
    </ModalContext.Provider>
  );
}
