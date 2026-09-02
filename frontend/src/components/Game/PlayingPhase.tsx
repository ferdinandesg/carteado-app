import styles from "@/styles/Game.module.scss";

import CarteadoTable from "./carteado.table";

export default function PlayingPhase() {
  return (
    <div className={styles.Game}>
      <CarteadoTable />
    </div>
  );
}
