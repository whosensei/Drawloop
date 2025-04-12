import axios from "axios"


export async function GetexistingRooms(){
    try{
        const tok = localStorage.getItem("token");
        if(!tok) {
            console.warn("No token found when fetching rooms");
            return [];
        }
        
        console.log("Fetching rooms from backend...");
        const Roomsdata = await axios.get(`${process.env.NEXT_PUBLIC_HTTP_BACKEND}/rooms`,{
            headers:{
                'authorization' : tok
            }
        });
        
        console.log("Rooms data received:", Roomsdata.data);
        
        if (!Roomsdata.data.rooms || !Array.isArray(Roomsdata.data.rooms)) {
            console.error("Invalid rooms data format:", Roomsdata.data);
            return [];
        }
        
        return Roomsdata.data.rooms;
    } catch(error) {
        console.error("Error fetching room data:", error);
        return [];
    }
}

export async function Createroom(newRoomName:string) {
    try{
       const tok = localStorage.getItem("token");
        if(!tok) return " "
        const msg = await axios.post(`${process.env.NEXT_PUBLIC_HTTP_BACKEND}/create-room`,{
          name : newRoomName
        },{
          headers:{
            'authorization' : tok
          }
        })
        return msg.data

    }catch(e){
        console.error("failed to create room",e)
    }
}

export async function LeaveRoom(roomId: number) {
    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication required");

        const response = await axios.delete(`${process.env.NEXT_PUBLIC_HTTP_BACKEND}/delete-room/${roomId}`, {
            headers: {
                'authorization': token
            }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to leave room:", error);
        throw error;
    }
}