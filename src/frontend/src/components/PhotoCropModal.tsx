import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface PhotoCropModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
}

const ID_PHOTO_ASPECT_RATIO = 3 / 4; // Standard ID photo ratio

export default function PhotoCropModal({ open, onClose, imageUrl, onCropComplete }: PhotoCropModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (open && imageUrl) {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        setScale(1);
        setPosition({ x: 0, y: 0 });
      };
      img.src = imageUrl;
    }
  }, [open, imageUrl]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = () => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const outputWidth = 300;
    const outputHeight = outputWidth / ID_PHOTO_ASPECT_RATIO;

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    const containerWidth = 400;
    const containerHeight = containerWidth / ID_PHOTO_ASPECT_RATIO;

    const scaledWidth = imageRef.current.width * scale;
    const scaledHeight = imageRef.current.height * scale;

    const sourceX = -position.x * (imageRef.current.width / containerWidth);
    const sourceY = -position.y * (imageRef.current.height / containerHeight);
    const sourceWidth = imageRef.current.width / scale;
    const sourceHeight = imageRef.current.height / scale;

    ctx.drawImage(
      imageRef.current,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      outputWidth,
      outputHeight
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const croppedUrl = URL.createObjectURL(blob);
        onCropComplete(croppedUrl);
        onClose();
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-chrome-300/20" aria-describedby="crop-modal-description">
        <DialogHeader>
          <DialogTitle className="tracking-wide">Crop Photo to ID Size</DialogTitle>
          <DialogDescription id="crop-modal-description">
            Drag to position your photo and use the zoom slider to adjust the size. The cropped area will be used for your ID card.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div
            className="relative bg-zinc-950 rounded-lg overflow-hidden mx-auto border border-chrome-300/20"
            style={{
              width: '400px',
              height: `${400 / ID_PHOTO_ASPECT_RATIO}px`,
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            role="img"
            aria-label="Photo crop preview area. Click and drag to reposition the photo."
          >
            {imageRef.current && (
              <img
                src={imageUrl}
                alt="Photo being cropped"
                className="absolute"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                  transformOrigin: 'top left',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              />
            )}
            <div className="absolute inset-0 border-2 border-chrome-300/50 pointer-events-none" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <label htmlFor="zoom-slider" className="text-sm text-muted-foreground">
              Zoom
            </label>
            <Slider
              id="zoom-slider"
              value={[scale]}
              onValueChange={(values) => setScale(values[0])}
              min={0.5}
              max={3}
              step={0.1}
              className="w-full"
              aria-label="Zoom level"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-chrome-300/30">
            Cancel
          </Button>
          <Button onClick={handleCrop} className="bg-chrome-300 hover:bg-chrome-200 text-black font-semibold">
            Crop & Confirm
          </Button>
        </DialogFooter>

        <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
      </DialogContent>
    </Dialog>
  );
}
