import axios from "axios"
import { types } from "util";
// import { WebSocket } from "ws";

export async function initDraw(canvas: HTMLCanvasElement ,roomId :string,socket : WebSocket) {

    const ctx = canvas.getContext("2d");

    if (!ctx) {
        return
    }

    type shapes = {

        type: "rect",
        StartX: number,
        StartY: number
        width: number,
        height: number,
    } |
    {
        type: "circle",
        radius: number,
        startX: number,
        startY: number
    }

    const ExistingShapes: shapes[] = await getExistingShapes(roomId);
    
    socket.onmessage = (event)=>{
        console.log("ye chal raha hai")
        const msg = JSON.parse(event.data);
        if(msg.type === "chat"){
            const shapedata = JSON.parse(msg.message);
            console.log(shapedata)
            ExistingShapes.push(shapedata.shape)
            clearCanvas(ExistingShapes,ctx,canvas)
        }
    }
    
    clearCanvas(ExistingShapes,ctx,canvas)
    
    let clicked = false;
    let StartX: number
    let StartY: number

    canvas.addEventListener("mousedown", (e) => {
        clicked = true
        StartX = e.clientX;
        StartY = e.clientY;
    })

    canvas.addEventListener("mouseup", (e) => {
        clicked = false
        e.clientX
        e.clientY

        const shape :shapes = {
            type:"rect",
            StartX,
            StartY,
            width : e.clientX-StartX,
            height : e.clientY-StartY
        }

        ExistingShapes.push(shape)

        const data = JSON.stringify({
            type : "chat",
            message : JSON.stringify({shape}),
            roomId
        })

        socket.send(data)
    })

    canvas.addEventListener("mousemove", (e) => {
        if (clicked) {
            const width: number = e.clientX - StartX;
            const height: number = e.clientY - StartY;
            clearCanvas(ExistingShapes,ctx,canvas)
            ctx.strokeStyle = "rgba(255,255,255)"
            ctx.strokeRect(StartX, StartY, width, height)
        }
    })

    function clearCanvas(ExistingShapes :shapes[],ctx: CanvasRenderingContext2D ,canvas :HTMLCanvasElement) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(0,0,0)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        ExistingShapes.map((shape)=>{
            if(shape.type === "rect"){
                ctx.strokeStyle = "rgba(255,255,255)"
                ctx.strokeRect(shape.StartX,shape.StartY,shape.width,shape.height)
            }else if(shape.type==="circle"){
                console.log("shape")
            }
        })
    }

    async function getExistingShapes(roomId :string){
        const res = await axios.get(`${process.env.NEXT_PUBLIC_HTTP_BACKEND!}/chats/${roomId}`);
        const messages = res.data.messages;

        const shapes = messages.map((x :{message :string})=>{
            const parsedData = JSON.parse(x.message)
            return parsedData.shape
        })

        return shapes
    }
}