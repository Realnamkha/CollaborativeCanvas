"use client";

import { useEffect, useRef, useState } from "react";
import { useSocket } from "../../hooks/useSocket";
import { Game } from "../draw/game";

export type Tool =
  | "rectangle"
  | "circle"
  | "triangle"
  | "pen"
  | "pan"
  | "line"
  | "arrow"
  | "text";

const tools: { id: Tool; label: string; icon: React.ReactNode }[] = [
  {
    id: "pen",
    label: "Pen",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    ),
  },
  {
    id: "pan",
    label: "Eraser",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M20 20H7L3 16l10-10 7 7-2.5 2.5" />
        <path d="M6 17L17 6" />
      </svg>
    ),
  },
  {
    id: "line",
    label: "Line",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        className="w-5 h-5"
      >
        <line x1="4" y1="20" x2="20" y2="4" />
      </svg>
    ),
  },
  {
    id: "arrow",
    label: "Arrow",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <line x1="5" y1="19" x2="19" y2="5" />
        <polyline points="8 5 19 5 19 16" />
      </svg>
    ),
  },
  {
    id: "rectangle",
    label: "Rectangle",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        className="w-5 h-5"
      >
        <rect x="3" y="5" width="18" height="14" rx="1" />
      </svg>
    ),
  },
  {
    id: "circle",
    label: "Circle",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="w-5 h-5"
      >
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    id: "triangle",
    label: "Triangle",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <polygon points="12 3 22 21 2 21" />
      </svg>
    ),
  },
  {
    id: "text",
    label: "Text",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    ),
  },
];

export default function Canvas({ roomId }: { roomId: string }) {
  const [game, setGame] = useState<Game>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { socket, loading } = useSocket(roomId);
  const [activeTool, setActiveTool] = useState<Tool>("circle");
  useEffect(() => {
    game?.setTool(activeTool);
  }, [activeTool, game]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !socket) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const g = new Game(canvas, roomId, socket);
    setGame(g);

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      g.clearCanvas(); // redraw after resize
    };
    window.addEventListener("resize", handleResize);

    return () => {
      g.destroy();
      window.removeEventListener("resize", handleResize);
    };
  }, [socket]);

  if (loading || !socket) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-zinc-50">
      <canvas
        ref={canvasRef}
        className="block absolute inset-0 w-screen h-screen"
      />

      {/* Toolbar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-zinc-900 rounded-2xl px-3 py-2 shadow-2xl z-10">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            title={tool.label}
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150
              ${
                activeTool === tool.id
                  ? "bg-white text-zinc-900 shadow"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-700"
              }
            `}
          >
            {tool.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
