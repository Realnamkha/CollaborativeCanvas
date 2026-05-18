import axios from "axios";
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
  private selectedTool: Tool = "circle";
  socket: WebSocket;

  // Store bound handlers so they can be removed later
  private handleMouseDown!: (e: MouseEvent) => void;
  private handleMouseUp!: (e: MouseEvent) => void;
  private handleMouseMove!: (e: MouseEvent) => void;

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
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(0,0,0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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
      this.clicked = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
    };

    this.handleMouseUp = (e) => {
      this.clicked = false;
      const width = e.clientX - this.startX;
      const height = e.clientY - this.startY;

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
      if (this.clicked) {
        const width = e.clientX - this.startX;
        const height = e.clientY - this.startY;

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

    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    this.canvas.addEventListener("mouseup", this.handleMouseUp);
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.canvas.removeEventListener("mouseup", this.handleMouseUp);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.socket.onmessage = null;
  }
}
