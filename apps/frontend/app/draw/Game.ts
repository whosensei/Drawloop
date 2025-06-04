import { Tool, StrokeThickness } from "@/components/canvas";
import { getExistingShapes, deleteShapes } from "./http";

type shapes = {
    type: "rect",
    StartX: number,
    StartY: number,
    width: number,
    height: number,
    color: string,
    thickness: number,
    id: string
} |
{
    type: "circle",
    StartX: number,
    StartY: number,
    radius: number,
    color: string,
    thickness: number,
    id: string
} |
{
    type: "line",
    StartX: number,
    StartY: number,
    width: number,
    height: number,
    color: string,
    thickness: number,
    id: string
} |
{
    type: "triangle",
    StartX: number,
    StartY: number,
    width: number,
    height: number,
    color: string,
    thickness: number,
    id: string
} |
{
    type: "arrow",
    StartX: number,
    StartY: number,
    width: number,
    height: number,
    color: string,
    thickness: number,
    id: string
} |
{
    type: "pen",
    points: { x: number, y: number }[],
    color: string,
    thickness: number,
    id: string
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
    private shapesToErase: Set<string> = new Set();

    socket: WebSocket;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        this.hasTouch = 'ontouchstart' in window;
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
        this.canvas.removeEventListener("touchstart", this.mouseDownHandler);
        this.canvas.removeEventListener("touchend", this.mouseUpHandler);
        this.canvas.removeEventListener("touchmove", this.mouseMoveHandler);
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
        try {
            console.log(`Loading existing shapes for room ${this.roomId}...`);
            this.existingShapes = await getExistingShapes(this.roomId);
            this.existingShapes = this.existingShapes.map(shape => {
                if (shape.type !== 'eraser' && !shape.id) {
                    shape.id = this.generateUniqueId();
                }
                return shape;
            }).filter(shape => shape.type !== 'eraser');
            console.log(`Loaded ${this.existingShapes.length} shapes for room ${this.roomId}`);
            this.clearCanvas();
        } catch (error) {
            console.error(`Failed to load existing shapes for room ${this.roomId}:`, error);
            // Continue with empty shapes array
            this.existingShapes = [];
            this.clearCanvas();
        }
    }

    private generateUniqueId(): string {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === "chat") {
                    const shapedata = JSON.parse(msg.message);

                    if (shapedata.shape.type === "eraser") {
                        const targetIds = shapedata.shape.targetIds;
                        if (Array.isArray(targetIds)) {
                            this.existingShapes = this.existingShapes.filter(shape => 
                                shape.type === 'eraser' || !targetIds.includes(shape.id)
                            );
                            this.clearCanvas();
                        } else {
                            console.warn("Received eraser message with invalid targetIds:", targetIds);
                        }
                    } else if (shapedata.shape.type) {
                        if (!shapedata.shape.id) {
                            shapedata.shape.id = this.generateUniqueId();
                        }
                        
                        if (!this.existingShapes.some(s => s.type !== 'eraser' && s.id === shapedata.shape.id)) {
                            this.existingShapes.push(shapedata.shape);
                            this.clearCanvas();
                        }
                    } else {
                        console.warn("Received message with unknown shape type:", shapedata);
                    }
                }
            } catch (error) {
                console.error("Failed to process WebSocket message:", error, "Data:", event.data);
            }
        };
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.selectedbgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.existingShapes.filter(shape => shape.type !== 'eraser').forEach((shape) => {
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
                
                this.ctx.moveTo(shape.StartX, shape.StartY);
                this.ctx.lineTo(shape.StartX + shape.width, shape.StartY);
                this.ctx.lineTo(shape.StartX + shape.width/2, shape.StartY + shape.height);
                this.ctx.closePath();
                this.ctx.stroke();
            } else if (shape.type === "arrow") {
                const headLength = Math.min(Math.abs(shape.width), Math.abs(shape.height)) / 4 || 10;
                const angle = Math.atan2(shape.height, shape.width);
                
                this.ctx.beginPath();
                this.ctx.strokeStyle = shape.color;
                this.ctx.lineWidth = Number(shape.thickness);
                
                this.ctx.moveTo(shape.StartX, shape.StartY);
                this.ctx.lineTo(shape.StartX + shape.width, shape.StartY + shape.height);
                
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
                if (!shape.points || shape.points.length < 2) return;
                this.ctx.beginPath();
                this.ctx.strokeStyle = shape.color;
                this.ctx.lineWidth = Number(shape.thickness);
                this.ctx.lineCap = 'round';
                this.ctx.lineJoin = 'round';
                this.ctx.moveTo(shape.points[0].x, shape.points[0].y);
                for (let i = 1; i < shape.points.length; i++) {
                    this.ctx.lineTo(shape.points[i].x, shape.points[i].y);
                }
                this.ctx.stroke();
            } 
        });
    }

    mouseDownHandler = (e: MouseEvent | TouchEvent) => {
        this.clicked = true;
        this.drawing = true;
        
        const pos = this.getEventPosition(e);
        this.startX = pos.x;
        this.startY = pos.y;
        
        this.lastX = this.startX;
        this.lastY = this.startY;

        if (this.selectedTool === "eraser") {
            this.shapesToErase.clear();
            this.checkEraserIntersection(this.startX, this.startY);
        } else if (this.selectedTool === "pen") {
            this.currentPenPoints = [{ x: this.startX, y: this.startY }];
        } else {
        }
    }

    mouseUpHandler = (e: MouseEvent | TouchEvent) => {
        if (!this.clicked) return;
        
        this.clicked = false;
        this.drawing = false;

        if (this.isAddingText) return;
        
        const pos = this.getEventPosition(e);
        let currentX = pos.x;
        let currentY = pos.y;

        const distance = Math.sqrt((currentX - this.startX) ** 2 + (currentY - this.startY) ** 2);
        const minimumDistance = 5;

        if (this.selectedTool === "eraser") {
            const idsToErase = Array.from(this.shapesToErase);
            if (idsToErase.length > 0) {
                const shape: shapes = {
                    type: "eraser",
                    targetIds: idsToErase
                };
                const messageData = JSON.stringify({ shape });
                const socketData = JSON.stringify({
                    type: "chat",
                    message: messageData,
                    roomId: this.roomId
                });
                this.socket.send(socketData);
                deleteShapes(this.roomId, idsToErase);
                this.shapesToErase.clear();
            }
            this.clearCanvas();
            return;
        }

        if (distance < minimumDistance && this.selectedTool !== 'pen') {
            this.clearCanvas();
            return;
        }

        let shape: shapes | null = null;
        const shapeId = this.generateUniqueId();

        switch (this.selectedTool) {
            case "rectangle":
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
                break;
            case "circle":
            shape = {
                type: "circle",
                    StartX: this.startX + (currentX - this.startX) / 2,
                    StartY: this.startY + (currentY - this.startY) / 2,
                    radius: distance / 2,
                color: this.selectedColor,
                thickness: Number(this.thickness),
                id: shapeId
            };
                if (shape.radius < 0) shape.radius = 0;
                break;
            case "line":
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
                break;
            case "triangle":
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
                break;
            case "arrow":
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
                break;
            case "pen":
                if (distance > 0) {
                     this.currentPenPoints.push({ x: currentX, y: currentY });
                }
                if (this.currentPenPoints.length < 2) {
                    this.clearCanvas();
                    return;
                }
            shape = {
                type: "pen",
                points: [...this.currentPenPoints],
                color: this.selectedColor,
                thickness: Number(this.thickness),
                id: shapeId
            };
                this.currentPenPoints = [];
                break;
        }

        if (!shape) {
            this.clearCanvas();
            return;
        }

        const messageData = JSON.stringify({ shape });
        const socketData = JSON.stringify({
            type: "chat",
            message: messageData,
            roomId: this.roomId
        });

        this.socket.send(socketData);
    }

    mouseMoveHandler = (e: MouseEvent | TouchEvent) => {
        if (!this.drawing) return;
        
        const pos = this.getEventPosition(e);
        let currentX = pos.x;
        let currentY = pos.y;
        
        if ('touches' in e) {
            e.preventDefault();
        }
        
        if (this.selectedTool === "eraser") {
            this.checkEraserIntersection(currentX, currentY);
            this.clearCanvas();
            this.drawEraserCursor(currentX, currentY);
            return;
        }

        const width: number = currentX - this.startX;
        const height: number = currentY - this.startY;
        const radius: number = Math.sqrt(width ** 2 + height ** 2) / 2;
        
            this.clearCanvas();
            this.ctx.strokeStyle = this.selectedColor;
        this.ctx.lineWidth = Number(this.thickness);

            switch (this.selectedTool) {
                case "rectangle":
                    this.ctx.strokeRect(this.startX, this.startY, width, height);
                    break;
                case "circle":
                    this.ctx.beginPath();
                this.ctx.arc(this.startX + width / 2, this.startY + height / 2, radius, 0, 2 * Math.PI);
                    this.ctx.stroke();
                    break;
                case "line":
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.startX, this.startY);
                this.ctx.lineTo(currentX, currentY);
                    this.ctx.stroke();
                    break;
                case "triangle":
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.startX, this.startY);
                    this.ctx.lineTo(this.startX + width, this.startY);
                    this.ctx.lineTo(this.startX + width/2, this.startY + height);
                    this.ctx.closePath();
                    this.ctx.stroke();
                    break;
                case "arrow":
                this.drawArrow(this.startX, this.startY, currentX, currentY, this.selectedColor, Number(this.thickness));
                    break;
                case "pen":
                this.currentPenPoints.push({ x: currentX, y: currentY });
                this.drawPenStroke(this.currentPenPoints, this.selectedColor, Number(this.thickness));
                    break;
        }
        
        this.lastX = currentX;
        this.lastY = currentY;
    }
    
    private getEventPosition(e: MouseEvent | TouchEvent): { x: number, y: number } {
        const rect = this.canvas.getBoundingClientRect();
        let clientX: number, clientY: number;

        if ('touches' in e) {
            if (e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.changedTouches[0].clientX;
                clientY = e.changedTouches[0].clientY;
            }
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }
    
    private drawEraserCursor(x: number, y: number) {
        const eraserRadius = 10;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x, y, eraserRadius, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(150, 150, 150, 0.8)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.fill();
        this.ctx.restore();
    }

    private drawArrow(fromX: number, fromY: number, toX: number, toY: number, color: string, thickness: number) {
        const headLength = Math.max(10, thickness * 3);
        const dx = toX - fromX;
        const dy = toY - fromY;
        const angle = Math.atan2(dy, dx);

        this.ctx.save();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = thickness;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);

        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
        
        this.ctx.stroke();
        this.ctx.restore();
    }

    private drawPenStroke(points: { x: number, y: number }[], color: string, thickness: number) {
        if (!points || points.length < 1) return;

        this.ctx.save();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = thickness;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.stroke();
        this.ctx.restore();
    }

    initMouseHandlers() {
        const tapstart = this.hasTouch ? 'touchstart' : 'mousedown';
        const tapmove = this.hasTouch ? 'touchmove' : 'mousemove';
        const tapend = this.hasTouch ? 'touchend' : 'mouseup';
        
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
        this.canvas.removeEventListener("mouseleave", this.mouseLeaveHandler);
        this.canvas.removeEventListener("touchstart", this.mouseDownHandler);
        this.canvas.removeEventListener("touchend", this.mouseUpHandler);
        this.canvas.removeEventListener("touchmove", this.mouseMoveHandler);
        
        this.canvas.addEventListener(tapstart, this.mouseDownHandler, { passive: false });
        this.canvas.addEventListener(tapend, this.mouseUpHandler);
        this.canvas.addEventListener(tapmove, this.mouseMoveHandler, { passive: false });
        
        this.canvas.addEventListener("mouseleave", this.mouseLeaveHandler);
    }
    
    mouseLeaveHandler = () => {
         if (this.drawing) {
                this.mouseUpHandler(new MouseEvent('mouseup', {
                clientX: this.lastX + this.canvas.getBoundingClientRect().left,
                clientY: this.lastY + this.canvas.getBoundingClientRect().top
            }));
        }
    }

    clearAll() {
        const allShapeIds = this.existingShapes
            .filter(shape => shape.type !== 'eraser')
            .map(shape => shape.id);

        if (allShapeIds.length > 0) {
            const shape: shapes = {
                type: "eraser",
                targetIds: allShapeIds
            };
            const messageData = JSON.stringify({ shape });
            const socketData = JSON.stringify({
                type: "chat",
                message: messageData,
                roomId: this.roomId
            });
            this.socket.send(socketData);
        }
        
        this.clearCanvas();
    }

    private checkEraserIntersection(eraserX: number, eraserY: number) {
        const eraserRadius = 10;

        this.existingShapes.forEach(shape => {
            if (shape.type === 'eraser' || this.shapesToErase.has(shape.id)) {
                return;
            }

            let intersects = false;
            switch (shape.type) {
                case 'rect':
                    intersects = this.isPointNearRect(eraserX, eraserY, shape, eraserRadius);
                    break;
                case 'circle':
                    intersects = this.isPointNearCircle(eraserX, eraserY, shape, eraserRadius);
                    break;
                case 'line':
                case 'arrow':
                    intersects = this.isPointNearLine(eraserX, eraserY, shape, eraserRadius);
                    break;
                case 'triangle':
                     intersects = this.isPointNearTriangle(eraserX, eraserY, shape, eraserRadius);
                    break;
                case 'pen':
                    intersects = this.isPointNearPenStroke(eraserX, eraserY, shape, eraserRadius);
                    break;
            }

            if (intersects) {
                this.shapesToErase.add(shape.id);
            }
        });
    }
    
    private isPointNearRect(px: number, py: number, rect: Extract<shapes, { type: 'rect' }>, tolerance: number): boolean {
        const halfThickness = rect.thickness / 2 + tolerance;
        const x1 = Math.min(rect.StartX, rect.StartX + rect.width);
        const y1 = Math.min(rect.StartY, rect.StartY + rect.height);
        const x2 = Math.max(rect.StartX, rect.StartX + rect.width);
        const y2 = Math.max(rect.StartY, rect.StartY + rect.height);

        const isInsideOuter = px >= x1 - halfThickness && px <= x2 + halfThickness &&
                              py >= y1 - halfThickness && py <= y2 + halfThickness;
                              
        const isOutsideInner = px <= x1 + halfThickness || px >= x2 - halfThickness ||
                               py <= y1 + halfThickness || py >= y2 - halfThickness;

        return isInsideOuter && isOutsideInner;
    }

    private isPointNearCircle(px: number, py: number, circle: Extract<shapes, { type: 'circle' }>, tolerance: number): boolean {
        const distSq = (px - circle.StartX) ** 2 + (py - circle.StartY) ** 2;
        const outerRadiusSq = (circle.radius + circle.thickness / 2 + tolerance) ** 2;
        const innerRadiusSq = Math.max(0, circle.radius - circle.thickness / 2 - tolerance) ** 2;
        return distSq <= outerRadiusSq && distSq >= innerRadiusSq;
    }

    private isPointNearLine(px: number, py: number, line: Extract<shapes, { type: 'line' | 'arrow' }>, tolerance: number): boolean {
        const x1 = line.StartX;
        const y1 = line.StartY;
        const x2 = line.StartX + line.width;
        const y2 = line.StartY + line.height;
        const distSq = this.distToSegmentSquared(px, py, x1, y1, x2, y2);
        const maxDistSq = (line.thickness / 2 + tolerance) ** 2;
        return distSq <= maxDistSq;
    }

    private isPointNearTriangle(px: number, py: number, triangle: Extract<shapes, { type: 'triangle' }>, tolerance: number): boolean {
        const p1 = { x: triangle.StartX, y: triangle.StartY };
        const p2 = { x: triangle.StartX + triangle.width, y: triangle.StartY + triangle.height };
        const p3 = { x: triangle.StartX - triangle.width, y: triangle.StartY + triangle.height };

        const thresholdSq = (triangle.thickness / 2 + tolerance) ** 2;

        return (
            this.distToSegmentSquared(px, py, p1.x, p1.y, p2.x, p2.y) <= thresholdSq ||
            this.distToSegmentSquared(px, py, p2.x, p2.y, p3.x, p3.y) <= thresholdSq ||
            this.distToSegmentSquared(px, py, p3.x, p3.y, p1.x, p1.y) <= thresholdSq
        );
    }
    
    private isPointNearPenStroke(px: number, py: number, pen: Extract<shapes, { type: 'pen' }>, tolerance: number): boolean {
        if (!pen.points || pen.points.length < 2) return false;
        const thresholdSq = (pen.thickness / 2 + tolerance) ** 2;

        for (let i = 0; i < pen.points.length - 1; i++) {
            const p1 = pen.points[i];
            const p2 = pen.points[i + 1];
            if (this.distToSegmentSquared(px, py, p1.x, p1.y, p2.x, p2.y) <= thresholdSq) {
                return true;
            }
        }
        return false;
    }

    private distToSegmentSquared(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
        const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
        if (l2 === 0) return (px - x1) ** 2 + (py - y1) ** 2;
        let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
        t = Math.max(0, Math.min(1, t));
        const projX = x1 + t * (x2 - x1);
        const projY = y1 + t * (y2 - y1);
        return (px - projX) ** 2 + (py - projY) ** 2;
    }

}

