import { Tool, StrokeThickness } from "@/components/canvas";
import { getExistingShapes } from "./http";

type shapes = {
    type: "rect",
    StartX: number,
    StartY: number,
    width: number,
    height: number,
    color: string,
    thickness: number,
    id?: string
} |
{
    type: "circle",
    StartX: number,
    StartY: number,
    radius: number,
    color: string,
    thickness: number,
    id?: string
} |
{
    type: "line",
    StartX: number,
    StartY: number,
    width: number,
    height: number,
    color: string,
    thickness: number,
    id?: string
} |
{
    type: "triangle",
    StartX: number,
    StartY: number,
    width: number,
    height: number,
    color: string,
    thickness: number,
    id?: string
} |
{
    type: "arrow",
    StartX: number,
    StartY: number,
    width: number,
    height: number,
    color: string,
    thickness: number,
    id?: string
} |
{
    type: "pen",
    points: { x: number, y: number }[],
    color: string,
    thickness: number,
    id?: string
} |
{
    type: "eraser",
    targetIds: string[],
} 

export class Game {

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: shapes[];
    private roomId: string;
    private clicked: boolean;
    private drawing: boolean = false;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "circle";
    private selectedColor: string = "#000000";
    private selectedbgColor: string = "#ffffff";
    private thickness: StrokeThickness = "1";
    private currentPenPoints: { x: number, y: number }[] = [];
    private currentEraserPoints: { x: number, y: number }[] = [];
    private isAddingText: boolean = false;

    socket: WebSocket;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    }

    setTool(tool: Tool) {
        this.selectedTool = tool;
    }

    setColor(color: string) {
        this.selectedColor = color;
        this.clearCanvas();
    }

    setBgColor(color: string) {
        this.selectedbgColor = color;
        this.clearCanvas();
    }

    setThickness(thickness: StrokeThickness) {
        this.thickness = thickness;
        this.clearCanvas();
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        console.log(this.existingShapes);
        this.clearCanvas();
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === "chat") {
                const shapedata = JSON.parse(msg.message);
                console.log(shapedata);

                if (shapedata.shape.type === "eraser") {
                    // Remove shapes with IDs in the targetIds array
                    const targetIds = shapedata.shape.targetIds;
                    // Use filter to create a new array rather than modifying the existing one
                    const updatedShapes = this.existingShapes.filter(shape => {
                        if ('id' in shape) {
                            return !targetIds.includes(shape.id);
                        }
                        return true;
                    });
                    // Clear the array and push new items (maintaining reference)
                    this.existingShapes.length = 0;
                    updatedShapes.forEach(shape => this.existingShapes.push(shape));
                } else {
                    // Generate a unique ID for the new shape if it doesn't have one
                    if (!shapedata.shape.id) {
                        shapedata.shape.id = Date.now() + Math.random().toString(36).substr(2, 9);
                    }
                    this.existingShapes.push(shapedata.shape);
                }

                this.clearCanvas();
            }
        };
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.selectedbgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.existingShapes.forEach((shape) => {
            if (shape.type === "rect") {
                this.ctx.strokeStyle = shape.color;
                this.ctx.lineWidth = Number(shape.thickness);
                this.ctx.strokeRect(shape.StartX, shape.StartY, shape.width, shape.height);
            } else if (shape.type === "circle") {
                this.ctx.beginPath();
                this.ctx.strokeStyle = shape.color;
                this.ctx.lineWidth = Number(shape.thickness);
                this.ctx.arc(shape.StartX, shape.StartY, shape.radius, 0, 2 * Math.PI);
                this.ctx.stroke();
            } else if (shape.type === "line") {
                this.ctx.beginPath();
                this.ctx.strokeStyle = shape.color;
                this.ctx.lineWidth = Number(shape.thickness);
                this.ctx.moveTo(shape.StartX, shape.StartY);
                this.ctx.lineTo(shape.StartX + shape.width, shape.StartY + shape.height);
                this.ctx.stroke();
            } else if (shape.type === "triangle") {
                this.ctx.beginPath();
                this.ctx.strokeStyle = shape.color;
                this.ctx.lineWidth = Number(shape.thickness);
                
                // Draw from the starting point (fixed position)
                this.ctx.moveTo(shape.StartX, shape.StartY);
                this.ctx.lineTo(shape.StartX + shape.width, shape.StartY);
                this.ctx.lineTo(shape.StartX + shape.width/2, shape.StartY + shape.height);
                this.ctx.closePath();
                this.ctx.stroke();
            } else if (shape.type === "arrow") {
                const headLength = Math.min(Math.abs(shape.width), Math.abs(shape.height)) / 4;
                const angle = Math.atan2(shape.height, shape.width);
                
                this.ctx.beginPath();
                this.ctx.strokeStyle = shape.color;
                this.ctx.lineWidth = Number(shape.thickness);
                
                // Draw the line
                this.ctx.moveTo(shape.StartX, shape.StartY);
                this.ctx.lineTo(shape.StartX + shape.width, shape.StartY + shape.height);
                
                // Draw the arrowhead
                this.ctx.lineTo(
                    shape.StartX + shape.width - headLength * Math.cos(angle - Math.PI / 6),
                    shape.StartY + shape.height - headLength * Math.sin(angle - Math.PI / 6)
                );
                this.ctx.moveTo(shape.StartX + shape.width, shape.StartY + shape.height);
                this.ctx.lineTo(
                    shape.StartX + shape.width - headLength * Math.cos(angle + Math.PI / 6),
                    shape.StartY + shape.height - headLength * Math.sin(angle + Math.PI / 6)
                );
                
                this.ctx.stroke();
            } else if (shape.type === "pen") {
                this.ctx.beginPath();
                this.ctx.strokeStyle = shape.color;
                this.ctx.lineWidth = Number(shape.thickness);
                const [first, ...rest] = shape.points;
                if (first) this.ctx.moveTo(first.x, first.y);
                rest.forEach(pt => this.ctx.lineTo(pt.x, pt.y));
                this.ctx.stroke();
            } 
            
            // No need to render eraser shapes - they only represent deletions
        });
    }

    mouseDownHandler = (e: MouseEvent) => {
        this.clicked = true;
        this.drawing = true;
        this.startX = e.clientX;
        this.startY = e.clientY;

        if (this.selectedTool === "eraser") {
            // For eraser, we'll track objects to remove on mouseup
            this.currentEraserPoints = [{ x: this.startX, y: this.startY }];
        } else {
            this.currentPenPoints = [{ x: this.startX, y: this.startY }];
        }
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX, this.startY);
    }

    mouseUpHandler = (e: MouseEvent) => {
        this.clicked = false;
        this.drawing = false;

        // Don't create a shape if we're adding text
        if (this.isAddingText) return;

        let shape: shapes | null = null;
        const shapeId = Date.now() + Math.random().toString(36).substr(2, 9);

        if (this.selectedTool === "rectangle") {
            shape = {
                type: "rect",
                StartX: this.startX,
                StartY: this.startY,
                width: e.clientX - this.startX,
                height: e.clientY - this.startY,
                color: this.selectedColor,
                thickness: Number(this.thickness),
                id: shapeId
            };
        } else if (this.selectedTool === "circle") {
            shape = {
                type: "circle",
                StartX: this.startX,
                StartY: this.startY,
                radius: Math.sqrt((e.clientX - this.startX) ** 2 + (e.clientY - this.startY) ** 2),
                color: this.selectedColor,
                thickness: Number(this.thickness),
                id: shapeId
            };
        } else if (this.selectedTool === "line") {
            shape = {
                type: "line",
                StartX: this.startX,
                StartY: this.startY,
                width: e.clientX - this.startX,
                height: e.clientY - this.startY,
                color: this.selectedColor,
                thickness: Number(this.thickness),
                id: shapeId
            };
        } else if (this.selectedTool === "triangle") {
            shape = {
                type: "triangle",
                StartX: this.startX,
                StartY: this.startY,
                width: e.clientX - this.startX,
                height: e.clientY - this.startY,
                color: this.selectedColor,
                thickness: Number(this.thickness),
                id: shapeId
            };
        } else if (this.selectedTool === "arrow") {
            shape = {
                type: "arrow",
                StartX: this.startX,
                StartY: this.startY,
                width: e.clientX - this.startX,
                height: e.clientY - this.startY,
                color: this.selectedColor,
                thickness: Number(this.thickness),
                id: shapeId
            };
        } else if (this.selectedTool === "pen") {
            shape = {
                type: "pen",
                points: [...this.currentPenPoints],
                color: this.selectedColor,
                thickness: Number(this.thickness),
                id: shapeId
            };
        } else if (this.selectedTool === "eraser") {
            // Find objects to erase based on intersection
            const eraserX = e.clientX;
            const eraserY = e.clientY;
            const eraserRadius = Number(this.thickness) * 4;

            // Find shapes that intersect with the eraser position
            const shapesToErase = this.existingShapes.filter(shape => {
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
                } else if (shape.type === "triangle" || shape.type === "arrow") {
                    // Expand hitbox for better detection
                    const expandedX = shape.StartX - eraserRadius;
                    const expandedY = shape.StartY - eraserRadius;
                    const expandedWidth = shape.width + eraserRadius * 2;
                    const expandedHeight = shape.height + eraserRadius * 2;

                    // Simple bounding box detection for triangle and arrow
                    return (
                        eraserX >= expandedX &&
                        eraserX <= expandedX + expandedWidth &&
                        eraserY >= expandedY &&
                        eraserY <= expandedY + expandedHeight
                    );
                } else if (shape.type === "pen") {
                    // Check if eraser is close to any point in the pen path
                    return shape.points.some(point => {
                        const dx = eraserX - point.x;
                        const dy = eraserY - point.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        return distance <= eraserRadius + shape.thickness / 2;
                    });
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
                const updatedShapes = this.existingShapes.filter(shape => {
                    if ('id' in shape) {
                        return !targetIds.includes(shape.id!);
                    }
                    return true;
                });

                // Clear the array and push new items (maintaining reference)
                this.existingShapes.length = 0;
                updatedShapes.forEach(shape => this.existingShapes.push(shape));

                this.clearCanvas();
            } else {
                // No shapes to erase
                return;
            }
        }

        if (!shape) {
            return;
        }

        const data = JSON.stringify({
            type: "chat",
            message: JSON.stringify({ shape }),
            roomId: this.roomId
        });

        this.socket.send(data);
    }

    mouseMoveHandler = (e: MouseEvent) => {
        if (this.clicked) {
            const width: number = e.clientX - this.startX;
            const height: number = e.clientY - this.startY;
            const radius: number = Math.sqrt((e.clientX - this.startX) ** 2 + (e.clientY - this.startY) ** 2);
            this.clearCanvas();
            this.ctx.strokeStyle = this.selectedColor;

            switch (this.selectedTool) {
                case "rectangle":
                    this.ctx.lineWidth = Number(this.thickness);
                    this.ctx.strokeRect(this.startX, this.startY, width, height);
                    break;
                case "circle":
                    this.ctx.beginPath();
                    this.ctx.lineWidth = Number(this.thickness);
                    this.ctx.arc(this.startX, this.startY, radius, 0, 2 * Math.PI);
                    this.ctx.stroke();
                    break;
                case "line":
                    this.ctx.beginPath();
                    this.ctx.lineWidth = Number(this.thickness);
                    this.ctx.moveTo(this.startX, this.startY);
                    this.ctx.lineTo(e.clientX, e.clientY);
                    this.ctx.stroke();
                    break;
                case "triangle":
                    this.ctx.beginPath();
                    this.ctx.lineWidth = Number(this.thickness);
                    
                    // Draw from the starting point (fixed position)
                    this.ctx.moveTo(this.startX, this.startY);
                    this.ctx.lineTo(this.startX + width, this.startY);
                    this.ctx.lineTo(this.startX + width/2, this.startY + height);
                    this.ctx.closePath();
                    this.ctx.stroke();
                    break;
                case "arrow":
                    const headLength = Math.min(Math.abs(width), Math.abs(height)) / 4;
                    const angle = Math.atan2(height, width);
                    
                    this.ctx.beginPath();
                    this.ctx.lineWidth = Number(this.thickness);
                    
                    // Draw the line
                    this.ctx.moveTo(this.startX, this.startY);
                    this.ctx.lineTo(e.clientX, e.clientY);
                    
                    // Draw the arrowhead
                    this.ctx.lineTo(
                        e.clientX - headLength * Math.cos(angle - Math.PI / 6),
                        e.clientY - headLength * Math.sin(angle - Math.PI / 6)
                    );
                    this.ctx.moveTo(e.clientX, e.clientY);
                    this.ctx.lineTo(
                        e.clientX - headLength * Math.cos(angle + Math.PI / 6),
                        e.clientY - headLength * Math.sin(angle + Math.PI / 6)
                    );
                    
                    this.ctx.stroke();
                    break;
                case "pen":
                    if (!this.drawing) return;
                    // Draw the current pen stroke
                    this.ctx.beginPath();
                    this.ctx.lineWidth = Number(this.thickness);
                    this.ctx.moveTo(this.currentPenPoints[0].x, this.currentPenPoints[0].y);
                    this.currentPenPoints.forEach(point => {
                        this.ctx.lineTo(point.x, point.y);
                    });
                    this.ctx.lineTo(e.clientX, e.clientY);
                    this.ctx.stroke();
                    this.currentPenPoints.push({ x: e.clientX, y: e.clientY });
                    break;
                case "eraser":
                    if (!this.drawing) return;
                    // Just show the eraser cursor
                    const eraserSize = Number(this.thickness) * 4;

                    // Draw temporary visual for the eraser cursor
                    this.ctx.save();
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = "#ff0000"; // Red outline for eraser cursor
                    this.ctx.lineWidth = 2;
                    this.ctx.arc(e.clientX, e.clientY, eraserSize / 2, 0, Math.PI * 2);
                    this.ctx.stroke();

                    // Show transparent fill
                    this.ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
                    this.ctx.fill();
                    this.ctx.restore();
                    break;
            }
        }
    }

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler);
        this.canvas.addEventListener("mouseup", this.mouseUpHandler);
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    }

    clearAll() {
        // Clear all shapes but keep the background color
        this.existingShapes = [];
        this.clearCanvas();
    }
}

