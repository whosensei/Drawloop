import axios from "axios"


export async function GetexistingRooms(){
    try{
        const tok = localStorage.getItem("token");
        if(!tok) return []
        const Roomsdata =await axios.get(`${process.env.NEXT_PUBLIC_HTTP_BACKEND}/rooms`,{
            headers:{
                'authorization' : tok
            }
        })
        return Roomsdata.data.rooms 
    }catch(error){
        console.error("error fetching data",error)
        return []
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