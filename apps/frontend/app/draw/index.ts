import { Sree_Krushnadevaraya } from "next/font/google";
import { types } from "util";

export function initDraw(canvas: HTMLCanvasElement) {

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


    const ExistingShapes: shapes[] =[];
    
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

        ExistingShapes.push({
            type:"rect",
            StartX,
            StartY,
            width : e.clientX-StartX,
            height : e.clientY-StartY
        })

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
}