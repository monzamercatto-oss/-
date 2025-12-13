import React, { useRef, useState, useEffect } from 'react';

interface TokenMakerProps {
  sourceImage: File | null;
}

export const TokenMaker: React.FC<TokenMakerProps> = ({ sourceImage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Load image when file changes
  useEffect(() => {
    if (sourceImage) {
      const img = new Image();
      img.src = URL.createObjectURL(sourceImage);
      img.onload = () => {
        setImage(img);
        setScale(1);
        setOffset({ x: 0, y: 0 });
      };
    }
  }, [sourceImage]);

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 512;
    canvas.width = size;
    canvas.height = size;

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Draw circular mask
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();

    // Draw Image
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    const centerX = size / 2 - (scaledWidth / 2) + offset.x;
    const centerY = size / 2 - (scaledHeight / 2) + offset.y;

    ctx.drawImage(image, centerX, centerY, scaledWidth, scaledHeight);

    // Draw border
    ctx.strokeStyle = '#d4af37'; // Gold
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 7.5, 0, Math.PI * 2);
    ctx.stroke();

  }, [image, scale, offset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'token.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  if (!sourceImage) return null;

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
      <h3 className="text-xl font-cinzel text-emerald-400">Token Generator</h3>
      <p className="text-sm text-gray-400">Drag to pan, slider to zoom.</p>
      
      <div className="relative overflow-hidden rounded-full shadow-2xl shadow-emerald-900/50 border-4 border-gray-800">
        <canvas
          ref={canvasRef}
          className="cursor-move bg-gray-800"
          style={{ width: '256px', height: '256px' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      <div className="w-full max-w-xs">
        <label className="text-xs text-gray-400">Zoom</label>
        <input
          type="range"
          min="0.2"
          max="3"
          step="0.1"
          value={scale}
          onChange={(e) => setScale(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>

      <button
        onClick={handleDownload}
        className="px-6 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded shadow-lg transition"
      >
        Download Token (PNG)
      </button>
    </div>
  );
};