"use client";

import { useEffect, useRef } from "react";
import initDraw from "../draw";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    initDraw(canvas);
  }, []);

  return (
    <div className="overflow-hidden">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}
