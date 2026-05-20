import { getExistingshapes } from "./http";
import { Shape } from ".";
import { Tool } from "../components/ChatRomClient";

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private roomId: string;
  private clicked: boolean;
  private existingShapes: Shape[];
  private startX = 0;
  private startY = 0;
  private panX = 0;
  private panY = 0;
  private isPanning = false;
  private lastPanX = 0;
  private lastPanY = 0;
  private scale = 1;
  private selectedTool: Tool = "circle";
  socket: WebSocket;

  // Store bound handlers so they can be removed later
  private handleMouseDown!: (e: MouseEvent) => void;
  private handleMouseUp!: (e: MouseEvent) => void;
  private handleMouseMove!: (e: MouseEvent) => void;
  private handleWheel!: (e: WheelEvent) => void;

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

  async init() {
    this.existingShapes = await getExistingshapes(this.roomId);
    this.clearCanvas();
  }

  setTool(tool: Tool) {
    this.selectedTool = tool;
  }
  toWorldX(screenX: number) {
    return (screenX - this.panX) / this.scale;
  }

  toWorldY(screenY: number) {
    return (screenY - this.panY) / this.scale;
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      console.log("received from server:", event.data);
      const message = JSON.parse(event.data);
      if (message.type === "chat") {
        const parsedShape = JSON.parse(message.message);
        this.existingShapes.push(parsedShape.shape);
        this.clearCanvas();
      }
    };
  }

  clearCanvas() {
    // Clear and fill background
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(0,0,0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.setTransform(this.scale, 0, 0, this.scale, this.panX, this.panY);
    this.existingShapes.map((shape) => {
      this.ctx.strokeStyle = "rgba(255,255,255)";
      if (shape.type === "rect") {
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      }
      if (shape.type === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(
          shape.centerX,
          shape.centerY,
          shape.radius,
          0,
          2 * Math.PI
        );
        this.ctx.stroke();
        this.ctx.closePath();
      }
    });
  }

  initMouseHandlers() {
    this.handleMouseDown = (e) => {
      console.log("mousedown button:", e.button);

      if (this.selectedTool === "pan") {
        this.isPanning = true;
        this.lastPanX = e.clientX;
        this.lastPanY = e.clientY;
        return;
      }

      if (e.button === 0) {
        this.clicked = true;
        this.startX = this.toWorldX(e.clientX);
        this.startY = this.toWorldY(e.clientY);
        console.log(
          "drawing started at world coords:",
          this.startX,
          this.startY
        );
      }
    };

    this.handleMouseUp = (e) => {
      if (this.isPanning) {
        console.log("panning stopped. final pan:", this.panX, this.panY);
        this.isPanning = false;
        return;
      }
      this.clicked = false;
      console.log("drawing stopped");
      const width = this.toWorldX(e.clientX) - this.startX;
      const height = this.toWorldY(e.clientY) - this.startY;

      if (this.selectedTool === "rectangle") {
        const shape: Shape = {
          type: "rect",
          x: this.startX,
          y: this.startY,
          width,
          height,
        };
        this.existingShapes.push(shape);
        this.clearCanvas();
        this.socket.send(
          JSON.stringify({
            type: "chat",
            message: JSON.stringify({ shape }),
            roomId: this.roomId,
          })
        );
      }

      if (this.selectedTool === "circle") {
        const radius = Math.max(height, width) / 2;
        const centerX = this.startX + radius;
        const centerY = this.startY + radius;
        const shape: Shape = { type: "circle", centerX, centerY, radius };
        this.existingShapes.push(shape);
        this.clearCanvas();
        this.socket.send(
          JSON.stringify({
            type: "chat",
            message: JSON.stringify({ shape }),
            roomId: this.roomId,
          })
        );
      }
    };

    this.handleMouseMove = (e) => {
      if (this.isPanning) {
        console.log("panning... panX:", this.panX, "panY:", this.panY);
        this.panX += e.clientX - this.lastPanX;
        this.panY += e.clientY - this.lastPanY;
        this.lastPanX = e.clientX;
        this.lastPanY = e.clientY;
        this.clearCanvas();
        return;
      }

      if (this.clicked) {
        const worldX = this.toWorldX(e.clientX);
        const worldY = this.toWorldY(e.clientY);
        const width = worldX - this.startX;
        const height = worldY - this.startY;

        if (this.selectedTool === "rectangle") {
          this.clearCanvas();
          this.ctx.strokeStyle = "rgba(255,255,255)";
          this.ctx.strokeRect(this.startX, this.startY, width, height);
        }

        if (this.selectedTool === "circle") {
          const radius = Math.max(width, height) / 2;
          const centerX = this.startX + radius;
          const centerY = this.startY + radius;
          this.clearCanvas();
          this.ctx.beginPath();
          this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          this.ctx.stroke();
          this.ctx.closePath();
        }
      }
    };
    this.handleWheel = (e) => {
      e.preventDefault();

      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1; // scroll down = zoom out, up = zoom in
      const newScale = this.scale * zoomFactor;
      // zoom toward mouse cursor
      this.panX = e.clientX - (e.clientX - this.panX) * (newScale / this.scale);
      this.panY = e.clientY - (e.clientY - this.panY) * (newScale / this.scale);

      this.scale = newScale;
      this.clearCanvas();
    };

    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    this.canvas.addEventListener("mouseup", this.handleMouseUp);
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
    this.canvas.addEventListener("wheel", this.handleWheel, { passive: false });
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.canvas.removeEventListener("mouseup", this.handleMouseUp);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.canvas.removeEventListener("wheel", this.handleWheel);
    this.socket.onmessage = null;
  }
}
