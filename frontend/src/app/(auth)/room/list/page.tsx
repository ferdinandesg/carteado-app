import useFetch from "@/hooks/useFetch"
type RoomsInterface = {}
export default function RoomList() {
    const { data, isLoading } = useFetch<RoomsInterface[]>({ url: "http://localhost:3001/api/rooms", method: 'GET' })

    return
}