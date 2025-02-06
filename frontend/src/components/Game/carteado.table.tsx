import Opponent from "../Opponent/Opponent";
import Table from "../Table";
import TableActions from "../TableActions";

export default function CarteadoTable() {
    return <Table
        tableActions={
            <TableActions />
        }
        OpponentComponent={Opponent}
    />
}