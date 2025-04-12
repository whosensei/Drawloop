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
    private selectedColor: string = "#FFFFFF";
    private selectedbgColor: string = "#121212";
    private thickness: StrokeThickness = "1";
    private currentPenPoints: { x: number, y: number }[] = [];
    private isAddingText: boolean = false;
    private hasTouch: boolean;
    private lastX: number = 0;
    private lastY: number = 0;
    private eraserLineWidth: number = 55;

    socket: WebSocket;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        // Detect touch support
        this.hasTouch = 'ontouchstart' in window;
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

    mouseDownHandler = (e: MouseEvent | TouchEvent) => {
        this.clicked = true;
        this.drawing = true;
        
        // Handle both mouse and touch events
        if ('touches' in e) {
            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;
        } else {
        this.startX = e.clientX;
        this.startY = e.clientY;
        }
        
        this.lastX = this.startX;
        this.lastY = this.startY;

        if (this.selectedTool === "eraser") {
            // Set up eraser drawing context
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.lineWidth = this.eraserLineWidth;
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.moveTo(this.startX, this.startY);
        } else {
            this.currentPenPoints = [{ x: this.startX, y: this.startY }];
            this.ctx.beginPath();
            this.ctx.moveTo(this.startX, this.startY);
        }
    }

    mouseUpHandler = (e: MouseEvent | TouchEvent) => {
        if (!this.clicked) return;
        
        this.clicked = false;
        this.drawing = false;

        // Don't create a shape if we're adding text
        if (this.isAddingText) return;
        
        // Get current position from event
        let currentX: number, currentY: number;
        if ('changedTouches' in e) {
            currentX = e.changedTouches[0].clientX;
            currentY = e.changedTouches[0].clientY;
        } else {
            currentX = e.clientX;
            currentY = e.clientY;
        }

        let shape: shapes | null = null;
        const shapeId = Date.now() + Math.random().toString(36).substr(2, 9);

        if (this.selectedTool === "rectangle") {
            shape = {
                type: "rect",
                StartX: this.startX,
                StartY: this.startY,
                width: currentX - this.startX,
                height: currentY - this.startY,
                color: this.selectedColor,
                thickness: Number(this.thickness),
                id: shapeId
            };
        } else if (this.selectedTool === "circle") {
            shape = {
                type: "circle",
                StartX: this.startX,
                StartY: this.startY,
                radius: Math.sqrt((currentX - this.startX) ** 2 + (currentY - this.startY) ** 2),
                color: this.selectedColor,
                thickness: Number(this.thickness),
                id: shapeId
            };
        } else if (this.selectedTool === "line") {
            shape = {
                type: "line",
                StartX: this.startX,
                StartY: this.startY,
                width: currentX - this.startX,
                height: currentY - this.startY,
                color: this.selectedColor,
                thickness: Number(this.thickness),
                id: shapeId
            };
        } else if (this.selectedTool === "triangle") {
            shape = {
                type: "triangle",
                StartX: this.startX,
                StartY: this.startY,
                width: currentX - this.startX,
                height: currentY - this.startY,
                color: this.selectedColor,
                thickness: Number(this.thickness),
                id: shapeId
            };
        } else if (this.selectedTool === "arrow") {
            shape = {
                type: "arrow",
                StartX: this.startX,
                StartY: this.startY,
                width: currentX - this.startX,
                height: currentY - this.startY,
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
            // Reset the composition mode after erasing
            this.ctx.restore();
            
            // For eraser, we'll analyze the erased area
            this.analyzeErasedArea();
            return; // Exit early as we handle erasing differently
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

    analyzeErasedArea() {
        // Get the current state of the canvas
        const imgData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const gap = 10; // Sampling gap
        let erasedCount = 0;
        let totalCount = 0;
        
        // Sample the canvas to detect erased areas
        for (let x = 0; x < imgData.width; x += gap) {
            for (let y = 0; y < imgData.height; y += gap) {
                const i = (y * imgData.width + x) * 4;
                totalCount++;
                
                // Check for transparent pixels (erased)
                if (imgData.data[i + 3] === 0) {
                    erasedCount++;
                }
            }
        }
        
        // If a significant portion has been erased, create an eraser action
        if (erasedCount / totalCount > 0.1) {
            const shape: shapes = {
                type: "eraser",
                targetIds: []  // Since this is a composite-based eraser, we don't target specific shapes
            };
            
            const data = JSON.stringify({
                type: "chat",
                message: JSON.stringify({ shape }),
                roomId: this.roomId
            });
            
            this.socket.send(data);
        }
        
        // Redraw the canvas to update the visual state
        this.clearCanvas();
    }

    mouseMoveHandler = (e: MouseEvent | TouchEvent) => {
        if (!this.clicked) return;
        
        // Get current position from event
        let currentX: number, currentY: number;
        if ('touches' in e) {
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
            
            // Prevent scrolling when drawing
            e.preventDefault();
        } else {
            currentX = e.clientX;
            currentY = e.clientY;
        }
        
        const width: number = currentX - this.startX;
        const height: number = currentY - this.startY;
        const radius: number = Math.sqrt((currentX - this.startX) ** 2 + (currentY - this.startY) ** 2);
        
        if (this.selectedTool === "eraser") {
            // For eraser, continuously draw in "destination-out" mode
            if (this.drawing) {
                this.ctx.lineTo(currentX, currentY);
                this.ctx.stroke();
                
                // Save last position for smoother lines
                this.lastX = currentX;
                this.lastY = currentY;
            }
            return;
        }
        
        // For other tools, preview the shape
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
                this.ctx.lineTo(currentX, currentY);
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
                this.ctx.lineTo(currentX, currentY);
                    
                    // Draw the arrowhead
                    this.ctx.lineTo(
                    currentX - headLength * Math.cos(angle - Math.PI / 6),
                    currentY - headLength * Math.sin(angle - Math.PI / 6)
                    );
                this.ctx.moveTo(currentX, currentY);
                    this.ctx.lineTo(
                    currentX - headLength * Math.cos(angle + Math.PI / 6),
                    currentY - headLength * Math.sin(angle + Math.PI / 6)
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
                this.ctx.lineTo(currentX, currentY);
                    this.ctx.stroke();
                this.currentPenPoints.push({ x: currentX, y: currentY });
                    break;
        }
    }

    initMouseHandlers() {
        // Determine event types based on device support
        const tapstart = this.hasTouch ? 'touchstart' : 'mousedown';
        const tapmove = this.hasTouch ? 'touchmove' : 'mousemove';
        const tapend = this.hasTouch ? 'touchend' : 'mouseup';
        
        // Remove old listeners if they exist
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
        this.canvas.removeEventListener("touchstart", this.mouseDownHandler);
        this.canvas.removeEventListener("touchend", this.mouseUpHandler);
        this.canvas.removeEventListener("touchmove", this.mouseMoveHandler);
        
        // Add new listeners
        this.canvas.addEventListener(tapstart, this.mouseDownHandler);
        this.canvas.addEventListener(tapend, this.mouseUpHandler);
        this.canvas.addEventListener(tapmove, this.mouseMoveHandler);
        
        // Add a listener to handle mouse leaving the canvas
        this.canvas.addEventListener("mouseleave", () => {
            if (this.clicked) {
                this.mouseUpHandler(new MouseEvent('mouseup', {
                    clientX: this.lastX,
                    clientY: this.lastY
                }));
            }
        });
    }
    
    // Update the eraser size
    setEraserSize(size: number) {
        this.eraserLineWidth = size;
    }

    clearAll() {
        // Clear all shapes but keep the background color
        this.existingShapes = [];
        this.clearCanvas();
    }
}

