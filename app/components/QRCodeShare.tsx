"use client";

import { useEffect, useRef } from "react";

type Props = {
  url: string;
  size?: number;
};

export default function QRCodeShare({ url, size = 128 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateQRCode = async () => {
      if (!canvasRef.current) return;

      try {
        // Simple QR code generation using a basic pattern
        // In a real app, you'd use a proper QR code library like 'qrcode'
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = size;
        canvas.height = size;

        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);

        // Draw a simple placeholder pattern
        ctx.fillStyle = '#000000';
        const cellSize = size / 25;
        
        // Draw corner markers (simplified QR code pattern)
        const drawCorner = (x: number, y: number) => {
          // Outer square
          ctx.fillRect(x, y, cellSize * 7, cellSize * 7);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + cellSize, y + cellSize, cellSize * 5, cellSize * 5);
          ctx.fillStyle = '#000000';
          ctx.fillRect(x + cellSize * 2, y + cellSize * 2, cellSize * 3, cellSize * 3);
        };

        // Draw three corner markers
        drawCorner(0, 0);
        drawCorner(size - cellSize * 7, 0);
        drawCorner(0, size - cellSize * 7);

        // Draw some random pattern in the middle (simplified)
        for (let i = 0; i < 100; i++) {
          const x = Math.floor(Math.random() * 20) * cellSize + cellSize * 2;
          const y = Math.floor(Math.random() * 20) * cellSize + cellSize * 2;
          ctx.fillRect(x, y, cellSize, cellSize);
        }

        // Add text
        ctx.fillStyle = '#666666';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Scan to join', size / 2, size - 5);

      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQRCode();
  }, [url, size]);

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas
        ref={canvasRef}
        className="border border-gray-200 dark:border-gray-600 rounded-lg"
        style={{ width: size, height: size }}
      />
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Scan QR code to join collaboration
      </p>
    </div>
  );
}
