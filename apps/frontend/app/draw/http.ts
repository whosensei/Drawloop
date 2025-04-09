import axios from "axios";

export async function getExistingShapes(roomId: string) {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_HTTP_BACKEND!}/chats/${roomId}`);
    const messages = res.data.messages;

    const shapes = messages.map((x: { message: string }) => {
        const parsedData = JSON.parse(x.message)
        return parsedData.shape
    })

    return shapes
}