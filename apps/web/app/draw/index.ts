import axios from "axios";
import { BACKEND_URL_SERVER } from "../../config";
import { RefObject } from "react";

export type Shape =
  | {
      id: string;
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      id: string;
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    };
// | {
//     type: "pan";
//   };

// export default async function initDraw(
//   canvas: HTMLCanvasElement,
//   roomId: string,
//   socket: WebSocket,
//   activeToolRef: RefObject<string>
// ) {
//   const ctx = canvas.getContext("2d");
//   if (!ctx) return;
//   socket.onmessage = (event) => {
//     console.log("received from server:", event.data);
//     const message = JSON.parse(event.data);
//     if (message.type === "chat") {
//       const parsedShape = JSON.parse(message.message);
//       existingShapes.push(parsedShape.shape);
//       clearCanvas(existingShapes, canvas, ctx);
//     }
//   };

//   const existingShapes: Shape[] = await getExistingshapes(roomId);
//   clearCanvas(existingShapes, canvas, ctx);
//   console.log("Active Tool:", activeToolRef);
//   console.log("First existing Shapes:", existingShapes);
//   clearCanvas(existingShapes, canvas, ctx);
//   console.log("Before entering");

//   let clicked = false;
//   ctx.fillStyle = "rgba(0,0,0)";
//   ctx.fillRect(0, 0, canvas.width, canvas.height);
//   let startX = 0;
//   let startY = 0;

//   canvas.addEventListener("mousedown", (e) => {
//     const tool = activeToolRef.current;
//     clicked = true;
//     console.log(tool);
//     if (tool === "circle") {
//       startX = e.clientX;
//       startY = e.clientY;
//     } else if (tool === "rectangle") {
//       startX = e.clientX;
//       startY = e.clientY;
//     }
//   });
//   canvas.addEventListener("mouseup", (e) => {
//     const tool = activeToolRef.current;
//     clicked = false;
//     const width = e.clientX - startX;
//     const height = e.clientY - startY;
//     if (tool === "rectangle") {
//       const shape: Shape = {
//         type: "rect",
//         x: startX,
//         y: startY,
//         width: width,
//         height: height,
//       };
//       existingShapes.push(shape);
//       clearCanvas(existingShapes, canvas, ctx);
//       socket.send(
//         JSON.stringify({
//           type: "chat",
//           message: JSON.stringify({
//             shape,
//           }),
//           roomId,
//         })
//       );
//     }
//     if (tool === "circle") {
//       const radius = Math.max(height, width) / 2;
//       const centerX = startX + radius;
//       const centerY = startY + radius;
//       const shape: Shape = {
//         type: "circle",
//         centerX,
//         centerY,
//         radius: radius,
//       };
//       existingShapes.push(shape);
//       clearCanvas(existingShapes, canvas, ctx);
//       socket.send(
//         JSON.stringify({
//           type: "chat",
//           message: JSON.stringify({
//             shape,
//           }),
//           roomId,
//         })
//       );
//     }
//     console.log("Existing Shapes:", existingShapes);
//   });
//   canvas.addEventListener("mousemove", (e) => {
//     const tool = activeToolRef.current;
//     const width = e.clientX - startX;
//     const height = e.clientY - startY;
//     if (clicked) {
//       if (tool === "rectangle") {
//         clearCanvas(existingShapes, canvas, ctx);
//         ctx.strokeStyle = "rgba(255,255,255)";
//         ctx.strokeRect(startX, startY, width, height);
//       }
//       if (tool === "circle") {
//         const radius = Math.max(width, height) / 2;
//         const centerX = startX + radius;
//         const centerY = startY + radius;
//         ctx.beginPath();
//         ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
//         ctx.stroke();
//         ctx.closePath();
//       }
//     }
//   });
// }

// function clearCanvas(
//   existingShapes: Shape[],
//   canvas: HTMLCanvasElement,
//   ctx: CanvasRenderingContext2D
// ) {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   ctx.fillStyle = "rgba(0,0,0)";
//   ctx.fillRect(0, 0, canvas.width, canvas.height);
//   existingShapes.map((shape) => {
//     if (shape.type === "rect") {
//       ctx.strokeStyle = "rgba(255,255,255)";
//       ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
//     }
//     if (shape.type === "circle") {
//       ctx.beginPath();
//       ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, 2 * Math.PI);
//       ctx.stroke();
//       ctx.closePath();
//     }
//   });
// }

// async function getExistingshapes(roomId: string) {
//   const response = await axios.get(`${BACKEND_URL_SERVER}/chats/${roomId}`);
//   const messages = response.data.messages;
//   const shapes = messages.map((x: { message: string }) => {
//     const messageData = JSON.parse(x.message);
//     return messageData.shape;
//   });

//   return shapes;
// }
