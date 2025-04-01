export function initDraw(canvas : HTMLCanvasElement){

    const ctx = canvas.getContext("2d");
    
    if(!ctx){
        return
    }
    ctx.fillStyle = "rgba(0,0,0)"
    ctx.fillRect(0,0,canvas.width,canvas.height)

    let clicked =false;
    let StartX: number
    let StartY: number

    canvas.addEventListener("mousedown", (e)=>{
        clicked = true
        StartX =e.clientX;
        StartY = e.clientY;
    })

    canvas.addEventListener("mouseup",(e)=>{
        clicked = false
        e.clientX
        e.clientY

    })

    canvas.addEventListener("mousemove",(e)=>{
        if(clicked){
            const width: number = e.clientX - StartX;
            const height: number = e.clientY - StartY;
            ctx.clearRect(0,0,canvas.width,canvas.height);
            ctx.fillStyle = "rgba(0,0,0)"
            ctx.fillRect(0,0,canvas.width,canvas.height)
            ctx.strokeStyle="rgba(255,255,255)"
            ctx.strokeRect(StartX,StartY,width,height)
        }
    })
}