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
  private selectedShape: Shape | null = null;
  private isDraggingHandle = false;
  private activeHandle: string | null = null;
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
  isInsideRect(shape: Shape, x: number, y: number) {
    if (shape.type !== "rect") return false;
    return (
      x >= shape.x &&
      x <= shape.x + shape.width &&
      y >= shape.y &&
      y <= shape.y + shape.height
    );
  }
  isInsideCircle(shape: Shape, x: number, y: number) {
    if (shape.type !== "circle") return false;
    const dx = x - shape.centerX;
    const dy = y - shape.centerY;
    return Math.sqrt(dx * dx + dy * dy) <= shape.radius;
  }
  drawHandle(x: number, y: number) {
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(x - 4, y - 4, 8, 8);
    this.ctx.strokeStyle = "rgba(0,150,255)";
    this.ctx.strokeRect(x - 4, y - 4, 8, 8);
  }

  getShapeBounds(shape: Shape) {
    if (shape.type === "rect") {
      return {
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height,
      };
    }
    if (shape.type === "circle") {
      return {
        x: shape.centerX - shape.radius,
        y: shape.centerY - shape.radius,
        width: shape.radius * 2,
        height: shape.radius * 2,
      };
    }
    return { x: 0, y: 0, width: 0, height: 0 };
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
      if (message.type === "update") {
        console.log("update");
        const parsedShape = JSON.parse(message.message);
        const updatedShape = parsedShape.shape;
        console.log("updated shape:", updatedShape);

        // find the shape by id and replace it
        const index = this.existingShapes.findIndex(
          (s) => s.id === updatedShape.id
        );
        if (index !== -1) {
          this.existingShapes[index] = updatedShape;
          this.clearCanvas();
        }
      }
    };
  }
  getClickedHandle(worldX: number, worldY: number): string | null {
    if (!this.selectedShape) return null;

    const bounds = this.getShapeBounds(this.selectedShape);
    const handles = {
      tl: { x: bounds.x - 5, y: bounds.y - 5 },
      tr: { x: bounds.x + bounds.width + 5, y: bounds.y - 5 },
      bl: { x: bounds.x - 5, y: bounds.y + bounds.height + 5 },
      br: { x: bounds.x + bounds.width + 5, y: bounds.y + bounds.height + 5 },
    };

    for (const [name, pos] of Object.entries(handles)) {
      // check if click is within 8px of handle center
      if (
        worldX >= pos.x - 8 &&
        worldX <= pos.x + 8 &&
        worldY >= pos.y - 8 &&
        worldY <= pos.y + 8
      ) {
        return name;
      }
    }
    return null;
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
    if (this.selectedShape) {
      this.ctx.strokeStyle = "rgba(0, 150, 255)"; // blue selection
      // this.ctx.setLineDash([]); // dashed border

      let bounds = this.getShapeBounds(this.selectedShape);
      this.ctx.strokeRect(
        bounds.x - 5,
        bounds.y - 5,
        bounds.width + 10,
        bounds.height + 10
      );
      // this.ctx.setLineDash([]);

      // draw 4 corner handles
      this.drawHandle(bounds.x - 5, bounds.y - 5); // top-left
      this.drawHandle(bounds.x + bounds.width + 5, bounds.y - 5); // top-right
      this.drawHandle(bounds.x - 5, bounds.y + bounds.height + 5); // bottom-left
      this.drawHandle(
        bounds.x + bounds.width + 5,
        bounds.y + bounds.height + 5
      ); // bottom-right
    }
  }

  initMouseHandlers() {
    this.handleMouseDown = (e) => {
      console.log("mousedown button:", e.button);

      if (this.selectedTool === "pan") {
        this.isPanning = true;
        this.lastPanX = e.clientX;
        this.lastPanY = e.clientY;
        return; // ✅ exits early
      }

      if (this.selectedTool === "select") {
        const worldX = this.toWorldX(e.clientX);
        const worldY = this.toWorldY(e.clientY);

        const handle = this.getClickedHandle(worldX, worldY);
        if (handle && this.selectedShape) {
          this.isDraggingHandle = true;
          this.activeHandle = handle;
          return;
        }

        this.selectedShape = null;
        for (const shape of this.existingShapes) {
          if (
            this.isInsideRect(shape, worldX, worldY) ||
            this.isInsideCircle(shape, worldX, worldY)
          ) {
            this.selectedShape = shape;
            break;
          }
        }
        this.clearCanvas();
        return; // ✅ exits early, never reaches clicked = true
      }

      // only reaches here for drawing tools
      if (e.button === 0) {
        this.clicked = true;
        this.startX = this.toWorldX(e.clientX);
        this.startY = this.toWorldY(e.clientY);
      }
    };

    this.handleMouseUp = (e) => {
      if (this.isPanning) {
        console.log("panning stopped. final pan:", this.panX, this.panY);
        this.isPanning = false;
        return;
      }
      if (this.isDraggingHandle) {
        this.isDraggingHandle = false;
        this.activeHandle = null;
        if (this.selectedShape) {
          console.log("1212");
          this.socket.send(
            JSON.stringify({
              type: "update",
              message: JSON.stringify({ shape: this.selectedShape }),
              roomId: this.roomId,
            })
          );
        }
        return;
      }
      this.clicked = false;
      console.log("drawing stopped");
      const width = this.toWorldX(e.clientX) - this.startX;
      const height = this.toWorldY(e.clientY) - this.startY;

      if (this.selectedTool === "rectangle") {
        const shape: Shape = {
          id: crypto.randomUUID(),
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
        const shape: Shape = {
          id: crypto.randomUUID(),
          type: "circle",
          centerX,
          centerY,
          radius,
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
      if (this.isDraggingHandle && this.selectedShape) {
        const worldX = this.toWorldX(e.clientX);
        const worldY = this.toWorldY(e.clientY);
        this.resizeShape(
          this.selectedShape,
          this.activeHandle!,
          worldX,
          worldY
        );
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
  resizeShape(shape: Shape, handle: string, worldX: number, worldY: number) {
    if (shape.type === "rect") {
      if (handle === "br") {
        // top-left fixed, stretch right and down
        shape.width = worldX - shape.x;
        shape.height = worldY - shape.y;
      }

      if (handle === "tl") {
        // bottom-right fixed, stretch left and up
        shape.width += shape.x - worldX;
        shape.height += shape.y - worldY;
        shape.x = worldX;
        shape.y = worldY;
      }

      if (handle === "tr") {
        // bottom-left fixed, stretch right and up
        shape.width = worldX - shape.x; // width stretches right
        shape.height += shape.y - worldY; // height stretches up
        shape.y = worldY; // top edge moves up
        // shape.x stays same ← bottom-left x is fixed
      }

      if (handle === "bl") {
        // top-right fixed, stretch left and down
        shape.width += shape.x - worldX; // width stretches left
        shape.height = worldY - shape.y; // height stretches down
        shape.x = worldX; // left edge moves
        // shape.y stays same ← top-right y is fixed
      }
      // add tr and bl similarly
    }

    if (shape.type === "circle") {
      const dx = worldX - shape.centerX;
      const dy = worldY - shape.centerY;
      shape.radius = Math.sqrt(dx * dx + dy * dy); // distance from center
    }
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.canvas.removeEventListener("mouseup", this.handleMouseUp);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.canvas.removeEventListener("wheel", this.handleWheel);
    this.socket.onmessage = null;
  }
}
