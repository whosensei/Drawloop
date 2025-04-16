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

// Function to delete shapes from the backend
export async function deleteShapes(roomId: string, shapeIds: string[]) {
    if (!shapeIds || shapeIds.length === 0) {
        return; // Nothing to delete
    }
    try {
        await axios.delete(`${process.env.NEXT_PUBLIC_HTTP_BACKEND!}/shapes`, {
            data: { roomId, shapeIds }, // Send data in the body for DELETE request
        });
    } catch (error) {
        console.error("Failed to delete shapes:", error);
        // Don't throw the error to prevent UI disruption during drawing
        // The socket-based shape management will ensure consistency even if backend delete fails
    }
}