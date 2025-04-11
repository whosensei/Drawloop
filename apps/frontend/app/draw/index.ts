import {getExistingShapes} from "./http"
// import { WebSocket } from "ws";

export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket, tool: string | null, color: string ,selectedbgColor :string,thickness :string
) {

    const context = canvas.getContext("2d");

    if (!context) {
        return
    }

    const ctx = context;

    type shapes = {
        type: "rect",
        StartX: number,
        StartY: number
        width: number,
        height: number,
        color: string
        thickness :number,
        id?: string
    } |
    {
        type: "circle",
        StartX: number,
        StartY: number,
        radius: number,
        color: string,
        thickness :number,
        id?: string
    } |
    {
        type: "line",
        StartX: number,
        StartY: number,
        width: number,
        height: number
        color: string,
        thickness :number,
        id?: string
    } |
    {
        type: "pen",
        points: { x: number, y: number }[],
        color: string,
        thickness :number,
        id?: string
    } |
    {
        type: "eraser",
        targetIds: string[],
    } |
    {
        type: "text",
        x: number,
        y: number,
        content: string,
        color: string,
        fontSize: number,
        id?: string
    }

    const ExistingShapes: shapes[] = await getExistingShapes(roomId);

    socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "chat") {
            const shapedata = JSON.parse(msg.message);
            console.log(shapedata)
            
            if (shapedata.shape.type === "eraser") {
                // Remove shapes with IDs in the targetIds array
                const targetIds = shapedata.shape.targetIds;
                // Use filter to create a new array rather than modifying the existing one
                const updatedShapes = ExistingShapes.filter(shape => {
                    if ('id' in shape) {
                        return !targetIds.includes(shape.id);
                    }
                    return true;
                });
                // Clear the array and push new items (maintaining reference)
                ExistingShapes.length = 0;
                updatedShapes.forEach(shape => ExistingShapes.push(shape));
            } else {
                // Generate a unique ID for the new shape if it doesn't have one
                if (!shapedata.shape.id) {
                    shapedata.shape.id = Date.now() + Math.random().toString(36).substr(2, 9);
                }
                ExistingShapes.push(shapedata.shape);
            }
            
            clearCanvas(ExistingShapes, ctx, canvas);
        }
    }

    clearCanvas(ExistingShapes, ctx, canvas)

    let clicked = false;
    let StartX: number
    let StartY: number
    let currentPenPoints: { x: number, y: number }[] = [];
    let currentEraserPoints: { x: number, y: number }[] = [];
    let drawing: boolean = false
    let isAddingText: boolean = false;
    let textInputElement: HTMLTextAreaElement | null = null;

    function handleMouseDown(e: MouseEvent) {
        clicked = true
        drawing = true
        StartX = e.clientX;
        StartY = e.clientY;
        
        if (tool === "eraser") {
            // For eraser, we'll track objects to remove on mouseup
            currentEraserPoints = [{ x: StartX, y: StartY }];
        } else {
        currentPenPoints = [{ x: StartX, y: StartY }];
        }
        ctx.beginPath();
        ctx.moveTo(StartX, StartY);
    }

    function handleMouseUp(e: MouseEvent) {
        clicked = false
        drawing = false

        // Don't create a shape if we're adding text
        if (isAddingText) return;

        let shape: shapes | null = null;
        const shapeId = Date.now() + Math.random().toString(36).substr(2, 9);

        if (tool === "rectangle") {
            shape = {
                type: "rect",
                StartX,
                StartY,
                width: e.clientX - StartX,
                height: e.clientY - StartY,
                color: color,
                thickness: Number(thickness),
                id: shapeId
            }
        } else if (tool === "circle") {
            shape = {
                type: "circle",
                StartX,
                StartY,
                radius: Math.sqrt((e.clientX - StartX) ** 2 + (e.clientY - StartY) ** 2),
                color: color,
                thickness: Number(thickness),
                id: shapeId
            }
        } else if (tool === "line") {
            shape = {
                type: "line",
                StartX,
                StartY,
                width: e.clientX - StartX,
                height: e.clientY - StartY,
                color: color,
                thickness: Number(thickness),
                id: shapeId
            }
        } else if (tool === "pen") {
            shape = {
                type: "pen",
                points: [...currentPenPoints],
                color: color,
                thickness: Number(thickness),
                id: shapeId
            };
        } else if (tool === "eraser") {
            // Find objects to erase based on intersection
            const eraserX = e.clientX;
            const eraserY = e.clientY;
            const eraserRadius = Number(thickness) * 4;
            
            // Find shapes that intersect with the eraser position
            const shapesToErase = ExistingShapes.filter(shape => {
                // Only consider shapes with IDs
                if (!('id' in shape)) return false;
                
                // Different hit detection for different shape types
                if (shape.type === "rect") {
                    // Expand rectangle by eraser radius for better hit detection
                    const expandedX = shape.StartX - eraserRadius;
                    const expandedY = shape.StartY - eraserRadius;
                    const expandedWidth = shape.width + eraserRadius * 2;
                    const expandedHeight = shape.height + eraserRadius * 2;
                    
                    return (
                        eraserX >= expandedX && 
                        eraserX <= expandedX + expandedWidth &&
                        eraserY >= expandedY && 
                        eraserY <= expandedY + expandedHeight
                    );
                } else if (shape.type === "circle") {
                    // Distance between eraser and circle center
                    const dx = eraserX - shape.StartX;
                    const dy = eraserY - shape.StartY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Hit if eraser is within expanded circle radius
                    return distance <= shape.radius + eraserRadius;
                } else if (shape.type === "line") {
                    // Calculate endpoints
                    const x1 = shape.StartX;
                    const y1 = shape.StartY;
                    const x2 = shape.StartX + shape.width;
                    const y2 = shape.StartY + shape.height;
                    
                    // Distance from point to line segment
                    const A = eraserX - x1;
                    const B = eraserY - y1;
                    const C = x2 - x1;
                    const D = y2 - y1;
                    
                    const dot = A * C + B * D;
                    const lenSq = C * C + D * D;
                    let param = -1;
                    
                    if (lenSq !== 0) param = dot / lenSq;
                    
                    let xx, yy;
                    
                    if (param < 0) {
                        xx = x1;
                        yy = y1;
                    } else if (param > 1) {
                        xx = x2;
                        yy = y2;
                    } else {
                        xx = x1 + param * C;
                        yy = y1 + param * D;
                    }
                    
                    const dx = eraserX - xx;
                    const dy = eraserY - yy;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    return distance <= eraserRadius + shape.thickness / 2;
                } else if (shape.type === "pen") {
                    // Check if eraser is close to any point in the pen path
                    return shape.points.some(point => {
                        const dx = eraserX - point.x;
                        const dy = eraserY - point.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        return distance <= eraserRadius + shape.thickness / 2;
                    });
                } else if (shape.type === "text") {
                    // Simple rectangular hit detection for text
                    const textWidth = shape.content.length * shape.fontSize * 0.6; // Approximate text width
                    const textHeight = shape.fontSize;
                    
                    return (
                        eraserX >= shape.x - eraserRadius && 
                        eraserX <= shape.x + textWidth + eraserRadius &&
                        eraserY >= shape.y - textHeight - eraserRadius && 
                        eraserY <= shape.y + eraserRadius
                    );
                }
                
                return false;
            });
            
            if (shapesToErase.length > 0) {
                // Create eraser shape with IDs of shapes to remove
                const targetIds = shapesToErase.map(shape => {
                    if ('id' in shape && typeof shape.id === 'string') {
                        return shape.id;
                    }
                    return '';
                }).filter(id => id !== '');
                
                shape = {
                    type: "eraser",
                    targetIds: targetIds
                };
                
                // Remove these shapes locally for immediate visual feedback
                const updatedShapes = ExistingShapes.filter(shape => {
                    if ('id' in shape) {
                        return !targetIds.includes(shape.id!);
                    }
                    return true;
                });
                
                // Clear the array and push new items (maintaining reference)
                ExistingShapes.length = 0;
                updatedShapes.forEach(shape => ExistingShapes.push(shape));
                
                clearCanvas(ExistingShapes, ctx, canvas);
            } else {
                // No shapes to erase
                return;
            }
        }

        if (!shape) {
            return
        }

        const data = JSON.stringify({
            type: "chat",
            message: JSON.stringify({ shape }),
            roomId
        })

        socket.send(data)
    }

    function handleMouseMove(e: MouseEvent) {
        if (clicked) {
            const width: number = e.clientX - StartX;
            const height: number = e.clientY - StartY;
            const radius: number = Math.sqrt((e.clientX - StartX) ** 2 + (e.clientY - StartY) ** 2)
            clearCanvas(ExistingShapes, ctx, canvas)
            ctx.strokeStyle = color
            
            switch (tool) {
                case "rectangle":
                    ctx.lineWidth = Number(thickness)
                    ctx.strokeRect(StartX, StartY, width, height)
                    break;
                case "circle":
                    ctx.beginPath();
                    ctx.lineWidth = Number(thickness)
                    ctx.arc(StartX, StartY, radius, 0, 2 * Math.PI);
                    ctx.stroke();
                    break;
                case "line":
                    ctx.beginPath();
                    ctx.lineWidth = Number(thickness)
                    ctx.moveTo(StartX, StartY)
                    ctx.lineTo(e.clientX, e.clientY)
                    ctx.stroke()
                    break;
                case "pen":
                    if (!drawing) return;
                    // Draw the current pen stroke
                    ctx.beginPath();
                    ctx.lineWidth = Number(thickness)
                    ctx.moveTo(currentPenPoints[0].x, currentPenPoints[0].y);
                    currentPenPoints.forEach(point => {
                        ctx.lineTo(point.x, point.y);
                    });
                    ctx.lineTo(e.clientX, e.clientY);
                    ctx.stroke();
                    currentPenPoints.push({ x: e.clientX, y: e.clientY });
                    break;
                case "eraser":
                    if (!drawing) return;
                    // Just show the eraser cursor
                    const eraserSize = Number(thickness) * 4;
                    
                    // Draw temporary visual for the eraser cursor
                    ctx.save();
                    ctx.beginPath();
                    ctx.strokeStyle = "#ff0000"; // Red outline for eraser cursor
                    ctx.lineWidth = 2;
                    ctx.arc(e.clientX, e.clientY, eraserSize/2, 0, Math.PI * 2);
                    ctx.stroke();
                    
                    // Show transparent fill
                    ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
                    ctx.fill();
                    ctx.restore();
                    break;
            }
        }
    }

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);

    function clearCanvas(ExistingShapes: shapes[], ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = selectedbgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ExistingShapes.forEach((shape) => {
            if (shape.type === "rect") {
                ctx.strokeStyle = shape.color
                ctx.lineWidth = Number(shape.thickness)
                ctx.strokeRect(shape.StartX, shape.StartY, shape.width, shape.height)
            } else if (shape.type === "circle") {
                ctx.beginPath();
                ctx.strokeStyle = shape.color
                ctx.lineWidth = Number(shape.thickness)
                ctx.arc(shape.StartX, shape.StartY, shape.radius, 0, 2 * Math.PI);
                ctx.stroke()
            } else if (shape.type === "line") {
                ctx.beginPath();
                ctx.strokeStyle = shape.color
                ctx.lineWidth = Number(shape.thickness)
                ctx.moveTo(shape.StartX, shape.StartY)
                ctx.lineTo(shape.StartX + shape.width, shape.StartY + shape.height)
                ctx.stroke()
            } else if (shape.type === "pen") {
                ctx.beginPath();
                ctx.strokeStyle = shape.color;
                ctx.lineWidth = Number(shape.thickness)
                const [first, ...rest] = shape.points;
                if (first) ctx.moveTo(first.x, first.y);
                rest.forEach(pt => ctx.lineTo(pt.x, pt.y));
                ctx.stroke();
            } else if (shape.type === "text") {
                ctx.font = `${shape.fontSize}px sans-serif`;
                ctx.fillStyle = shape.color;
                ctx.fillText(shape.content, shape.x, shape.y);
            }
            // No need to render eraser shapes - they only represent deletions
        });
    }

    // Clean up text input on mouse click outside
    document.addEventListener('mousedown', (e) => {
        if (textInputElement && e.target !== textInputElement) {
            const content = textInputElement.value.trim();
            if (content) {
                // Add text to the canvas
                const textShape: shapes = {
                    type: "text",
                    x: parseInt(textInputElement.style.left),
                    y: parseInt(textInputElement.style.top),
                    content: content,
                    color: color,
                    fontSize: Number(thickness) * 5 + 10
                };
                
                // Send to server
                const data = JSON.stringify({
                    type: "chat",
                    message: JSON.stringify({ shape: textShape }),
                    roomId
                });
                socket.send(data);
            }
            
            // Remove the textarea
            document.body.removeChild(textInputElement);
            textInputElement = null;
            isAddingText = false;
        }
    });

    // Clean up event listeners when component unmounts
    return () => {
        if (textInputElement) {
            document.body.removeChild(textInputElement);
        }
    };
}

