"use client";

import { useEffect, useRef } from "react";

interface WaveformProps {
  analyser: AnalyserNode | null;
  color?: string;
  active: boolean;
}

export function Waveform({ analyser, color = "#00d9ff", active }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    let frameId: number;

    const draw = () => {
      frameId = requestAnimationFrame(draw);
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);
      if (!active) return;

      analyser.getByteTimeDomainData(dataArray);

      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(width, height / 2);
      ctx.stroke();
    };

    draw();
    return () => cancelAnimationFrame(frameId);
  }, [analyser, color, active]);

  return <canvas ref={canvasRef} width={320} height={64} className="h-16 w-full" />;
}
