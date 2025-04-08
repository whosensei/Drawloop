import axios from "axios"

export async function clearAll(
    roomId: string
) {
    try{
        const sanitizedRoomId = roomId.replace(/[^0-9]/,"");
        console.log(sanitizedRoomId)
        await axios.delete(`${process.env.NEXT_PUBLIC_HTTP_BACKEND!}/chats/${sanitizedRoomId}`)
    }catch(error){
        console.log("Failed to get ")
    }
}