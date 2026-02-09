import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eraser } from 'lucide-react';
import { useTheme } from 'next-themes';

interface SignaturePadProps {
  onSignatureChange: (signatureDataUrl: string | null) => void;
  label?: string;
  required?: boolean;
}

export default function SignaturePad({ onSignatureChange, label = 'Signature', required = false }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const { resolvedTheme } = useTheme();

  // Get theme-aware colors
  const isDark = resolvedTheme === 'dark';
  const bgColor = isDark ? '#1a1a2e' : '#ffffff';
  const strokeColor = isDark ? '#e0e0e0' : '#000000';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get CSS dimensions
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set backing store size (actual pixel dimensions)
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Reset transform to avoid compounding
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Scale context to match DPR
    ctx.scale(dpr, dpr);

    // Fill background with theme-aware color
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Configure drawing style with theme-aware stroke color
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setContext(ctx);

    // Re-measure on window resize
    const handleResize = () => {
      const newRect = canvas.getBoundingClientRect();
      const newDpr = window.devicePixelRatio || 1;
      
      canvas.width = newRect.width * newDpr;
      canvas.height = newRect.height * newDpr;
      
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(newDpr, newDpr);
      
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      setHasSignature(false);
      onSignatureChange(null);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [bgColor, strokeColor, onSignatureChange]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!context) return;
    
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    
    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;
    
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    
    context.lineTo(x, y);
    context.stroke();
    
    if (!hasSignature) {
      setHasSignature(true);
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    if (hasSignature && canvasRef.current) {
      // Convert canvas to data URL and notify parent
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onSignatureChange(dataUrl);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !context) return;

    // Clear the entire canvas
    const dpr = window.devicePixelRatio || 1;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Restore transform and redraw background
    context.scale(dpr, dpr);
    context.fillStyle = bgColor;
    context.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    
    // Restore stroke style
    context.strokeStyle = strokeColor;
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    
    setHasSignature(false);
    onSignatureChange(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
          {!required && <span className="text-muted-foreground ml-1">(Optional)</span>}
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearSignature}
          disabled={!hasSignature}
          className="h-8"
        >
          <Eraser className="w-4 h-4 mr-2" />
          Clear
        </Button>
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-40 border-2 border-border rounded-lg cursor-crosshair touch-none"
          style={{ 
            width: '100%', 
            height: '160px',
            backgroundColor: bgColor
          }}
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-muted-foreground text-sm">Sign here</p>
          </div>
        )}
      </div>
    </div>
  );
}
