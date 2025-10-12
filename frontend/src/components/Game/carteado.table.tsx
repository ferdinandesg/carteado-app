import Opponent from "../Opponent/Opponent";
import Table from "../Table";

export default function CarteadoTable() {
    return <Table
        tableActions={
            null
        }
        OpponentComponent={Opponent}
    />
}