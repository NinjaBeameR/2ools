import React, { useState, useRef, useEffect } from 'react';
import { Camera, Download, Copy, Crop, Pencil, Type, Square, Circle, ArrowRight, Eraser } from 'lucide-react';

function ScreenshotCapture() {
  const [screenshot, setScreenshot] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState(null); // 'pen', 'arrow', 'rectangle', 'circle', 'text'
  const [color, setColor] = useState('#FF0000');
  const [lineWidth, setLineWidth] = useState(3);
  const canvasRef = useRef(null);
  const [startPos, setStartPos] = useState(null);
  const [annotations, setAnnotations] = useState([]);

  const captureScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' }
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        stream.getTracks().forEach(track => track.stop());

        const dataUrl = canvas.toDataURL('image/png');
        setScreenshot(dataUrl);
        setAnnotations([]);
      };
    } catch (err) {
      alert('Screenshot cancelled or not supported');
    }
  };

  useEffect(() => {
    if (screenshot && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Redraw annotations
        annotations.forEach(ann => drawAnnotation(ctx, ann));
      };
      img.src = screenshot;
    }
  }, [screenshot, annotations]);

  const drawAnnotation = (ctx, ann) => {
    ctx.strokeStyle = ann.color;
    ctx.fillStyle = ann.color;
    ctx.lineWidth = ann.lineWidth;

    if (ann.type === 'pen') {
      ctx.beginPath();
      ctx.moveTo(ann.points[0].x, ann.points[0].y);
      ann.points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    } else if (ann.type === 'arrow') {
      drawArrow(ctx, ann.start.x, ann.start.y, ann.end.x, ann.end.y);
    } else if (ann.type === 'rectangle') {
      ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);
    } else if (ann.type === 'circle') {
      ctx.beginPath();
      ctx.arc(ann.x, ann.y, ann.radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (ann.type === 'text') {
      ctx.font = `${ann.fontSize}px Arial`;
      ctx.fillText(ann.text, ann.x, ann.y);
    }
  };

  const drawArrow = (ctx, fromX, fromY, toX, toY) => {
    const headLength = 15;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  };

  const handleMouseDown = (e) => {
    if (!drawMode) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPos({ x, y });
    setIsDrawing(true);

    if (drawMode === 'pen') {
      setAnnotations([...annotations, { type: 'pen', points: [{ x, y }], color, lineWidth }]);
    } else if (drawMode === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        setAnnotations([...annotations, { type: 'text', text, x, y, fontSize: 20, color }]);
      }
      setDrawMode(null);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !drawMode) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (drawMode === 'pen') {
      const newAnnotations = [...annotations];
      newAnnotations[newAnnotations.length - 1].points.push({ x, y });
      setAnnotations(newAnnotations);
    }
  };

  const handleMouseUp = (e) => {
    if (!isDrawing || !startPos) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (drawMode === 'arrow') {
      setAnnotations([...annotations, { type: 'arrow', start: startPos, end: { x, y }, color, lineWidth }]);
    } else if (drawMode === 'rectangle') {
      setAnnotations([...annotations, { 
        type: 'rectangle', 
        x: Math.min(startPos.x, x), 
        y: Math.min(startPos.y, y), 
        width: Math.abs(x - startPos.x), 
        height: Math.abs(y - startPos.y), 
        color, 
        lineWidth 
      }]);
    } else if (drawMode === 'circle') {
      const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
      setAnnotations([...annotations, { type: 'circle', x: startPos.x, y: startPos.y, radius, color, lineWidth }]);
    }

    setIsDrawing(false);
    setStartPos(null);
  };

  const downloadScreenshot = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `screenshot-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const copyToClipboard = async () => {
    if (!canvasRef.current) return;
    try {
      const blob = await new Promise(resolve => canvasRef.current.toBlob(resolve));
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      alert('Screenshot copied to clipboard!');
    } catch (err) {
      alert('Failed to copy to clipboard');
    }
  };

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Screenshot Capture</h1>

      <div className="flex gap-4 mb-4 flex-wrap">
        <button
          onClick={captureScreen}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Camera size={20} />
          Capture Screen
        </button>

        {screenshot && (
          <>
            <button
              onClick={downloadScreenshot}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download size={20} />
              Download
            </button>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Copy size={20} />
              Copy
            </button>
          </>
        )}
      </div>

      {screenshot && (
        <>
          <div className="flex gap-2 mb-4 flex-wrap items-center">
            <button
              onClick={() => setDrawMode(drawMode === 'pen' ? null : 'pen')}
              className={`p-2 rounded ${drawMode === 'pen' ? 'bg-blue-600 text-white' : 'bg-white'}`}
              title="Draw"
            >
              <Pencil size={20} />
            </button>
            <button
              onClick={() => setDrawMode(drawMode === 'arrow' ? null : 'arrow')}
              className={`p-2 rounded ${drawMode === 'arrow' ? 'bg-blue-600 text-white' : 'bg-white'}`}
              title="Arrow"
            >
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => setDrawMode(drawMode === 'rectangle' ? null : 'rectangle')}
              className={`p-2 rounded ${drawMode === 'rectangle' ? 'bg-blue-600 text-white' : 'bg-white'}`}
              title="Rectangle"
            >
              <Square size={20} />
            </button>
            <button
              onClick={() => setDrawMode(drawMode === 'circle' ? null : 'circle')}
              className={`p-2 rounded ${drawMode === 'circle' ? 'bg-blue-600 text-white' : 'bg-white'}`}
              title="Circle"
            >
              <Circle size={20} />
            </button>
            <button
              onClick={() => setDrawMode(drawMode === 'text' ? null : 'text')}
              className={`p-2 rounded ${drawMode === 'text' ? 'bg-blue-600 text-white' : 'bg-white'}`}
              title="Text"
            >
              <Type size={20} />
            </button>
            <button
              onClick={() => setAnnotations([])}
              className="p-2 rounded bg-red-600 text-white hover:bg-red-700"
              title="Clear Annotations"
            >
              <Eraser size={20} />
            </button>

            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
              title="Color"
            />
            <input
              type="range"
              min="1"
              max="10"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-24"
              title="Line Width"
            />
          </div>

          <div className="flex-1 overflow-auto bg-white rounded-lg shadow-lg p-4">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="max-w-full cursor-crosshair"
            />
          </div>
        </>
      )}

      {!screenshot && (
        <div className="flex-1 flex items-center justify-center bg-white rounded-lg shadow-lg">
          <div className="text-center text-gray-400">
            <Camera size={64} className="mx-auto mb-4" />
            <p>Click "Capture Screen" to take a screenshot</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScreenshotCapture;
