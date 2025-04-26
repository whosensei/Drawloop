import axios from "axios"

export async function clearAll(
    roomId: string
) {
    try{
        const sanitizedRoomId = roomId.replace(/[^0-9]/,"");
        await axios.delete(`/api/chats/${sanitizedRoomId}`)
    }catch(error){
        // Failed to clear the room
        console.error("Failed to clear the room",error)
    }
}