import React, { useState, useRef, useEffect, useCallback } from 'react';
import Button from './Button';

interface AlbumArtEditorProps {
  imageSrc: string;
  title: string;
  artist: string;
  onSave: (albumArtUrl: string) => void;
  isEditing?: boolean;
}

const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17 3H5a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2zM5 15V5h12v10H5z" /><path d="M13 9H7v4h6V9z" /></svg>;


const AlbumArtEditor: React.FC<AlbumArtEditorProps> = ({ imageSrc, title, artist, onSave, isEditing }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [titleFontSize, setTitleFontSize] = useState(80);
  const [artistFontSize, setArtistFontSize] = useState(40);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textPosition, setTextPosition] = useState<'bottom-left' | 'bottom-center' | 'bottom-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'top-left' | 'top-center' | 'top-right'>('bottom-left');
  const [textRotation, setTextRotation] = useState(0);
  const [textLayout, setTextLayout] = useState<'straight' | 'curved-top' | 'curved-bottom'>('straight');
  const [letterSpacing, setLetterSpacing] = useState(12);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      const canvasSize = 1024;
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      ctx.drawImage(img, 0, 0, canvasSize, canvasSize);

      ctx.fillStyle = textColor;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 10;
      ctx.textBaseline = 'middle';

      if (textLayout === 'straight') {
        drawStraightLayout(ctx, canvasSize);
      } else {
        drawCurvedLayout(ctx, canvasSize);
      }
    };
  }, [imageSrc, title, artist, titleFontSize, artistFontSize, textColor, textPosition, textRotation, textLayout, letterSpacing]);

  const drawStraightLayout = (ctx: CanvasRenderingContext2D, canvasSize: number) => {
    let titleX, titleY, artistX, artistY;
    const margin = canvasSize * 0.05;
    const gap = 20;

    const titleTextHeight = titleFontSize;
    const artistTextHeight = artistFontSize;
    
    // Set alignment and calculate X coordinates
    if (textPosition.includes('left')) {
        ctx.textAlign = 'left';
        titleX = margin;
        artistX = margin;
    } else if (textPosition.includes('center')) {
        ctx.textAlign = 'center';
        titleX = canvasSize / 2;
        artistX = canvasSize / 2;
    } else { // right
        ctx.textAlign = 'right';
        titleX = canvasSize - margin;
        artistX = canvasSize - margin;
    }

    // Calculate Y coordinates
    if (textPosition.startsWith('top')) {
        titleY = margin + titleTextHeight / 2;
        artistY = titleY + titleTextHeight / 2 + gap + artistTextHeight / 2;
    } else if (textPosition.startsWith('middle')) {
        const totalHeight = titleTextHeight + artistTextHeight + gap;
        titleY = (canvasSize / 2) - (totalHeight / 2) + (titleTextHeight / 2);
        artistY = titleY + titleTextHeight / 2 + gap + artistTextHeight / 2;
    } else { // bottom
        artistY = canvasSize - margin - artistTextHeight / 2;
        titleY = artistY - artistTextHeight / 2 - gap - titleTextHeight / 2;
    }
    
    const pivotX = (textPosition.includes('left')) ? titleX : (textPosition.includes('right')) ? titleX : canvasSize / 2;
    const pivotY = (textPosition.startsWith('top')) ? titleY : (textPosition.startsWith('bottom')) ? artistY : canvasSize / 2;
    
    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(textRotation * Math.PI / 180);
    ctx.translate(-pivotX, -pivotY);

    ctx.font = `bold ${titleFontSize}px 'Inter', sans-serif`;
    ctx.fillText(title, titleX, titleY);

    ctx.font = `${artistFontSize}px 'Inter', sans-serif`;
    ctx.fillText(artist, artistX, artistY);
    
    ctx.restore();
  };

  const drawCurvedLayout = (ctx: CanvasRenderingContext2D, canvasSize: number) => {
    const isTopCurve = textLayout === 'curved-top';
    const centerX = canvasSize / 2;
    const centerY = isTopCurve ? canvasSize * 0.45 : canvasSize * 0.55;
    const titleRadius = canvasSize * 0.35;
    const artistRadius = titleRadius + (isTopCurve ? titleFontSize + 15 : -artistFontSize - 15);

    ctx.font = `bold ${titleFontSize}px 'Inter', sans-serif`;
    drawTextOnArc(ctx, title, centerX, centerY, titleRadius, isTopCurve);
    
    ctx.font = `${artistFontSize}px 'Inter', sans-serif`;
    drawTextOnArc(ctx, artist, centerX, centerY, artistRadius, isTopCurve);
  };
  
  const drawTextOnArc = (ctx: CanvasRenderingContext2D, text: string, centerX: number, centerY: number, radius: number, isTop: boolean) => {
    ctx.textAlign = 'center';
    const angleStep = letterSpacing / radius;
    const totalAngle = (text.length -1) * angleStep;
    let startAngle = isTop ? -Math.PI/2 - totalAngle/2 : Math.PI/2 - totalAngle/2;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const currentAngle = startAngle + i * angleStep;
        
        ctx.save();
        const x = centerX + Math.cos(currentAngle) * radius;
        const y = centerY + Math.sin(currentAngle) * radius;
        ctx.translate(x, y);
        ctx.rotate(currentAngle + (isTop ? Math.PI / 2 : -Math.PI / 2));
        ctx.fillText(char, 0, 0);
        ctx.restore();
    }
  };


  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `${artist} - ${title}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };
  
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  // FIX: Refactored the Control component to use a standard interface with React.FC. This resolves TypeScript errors where the 'children' prop was not being correctly identified.
  interface ControlProps {
    label: string;
    children: React.ReactNode;
    className?: string;
  }
  const Control: React.FC<ControlProps> = ({ label, children, className = '' }) => (
    <div className={className}>
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        {children}
    </div>
  );

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="w-full aspect-square rounded-lg shadow-lg" />
      
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-900/50 p-4 rounded-lg">
        <Control label="제목 크기" className="lg:col-span-2">
            <input type="range" min="40" max="150" value={titleFontSize} onChange={e => setTitleFontSize(parseInt(e.target.value))} className="w-full" />
        </Control>
        <Control label="아티스트 크기" className="lg:col-span-2">
            <input type="range" min="20" max="80" value={artistFontSize} onChange={e => setArtistFontSize(parseInt(e.target.value))} className="w-full" />
        </Control>
        <Control label="텍스트 레이아웃">
            <select value={textLayout} onChange={e => setTextLayout(e.target.value as any)} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 h-10 focus:ring-cyan-500 focus:border-cyan-500">
                <option value="straight">직선</option>
                <option value="curved-top">곡선 (상단)</option>
                <option value="curved-bottom">곡선 (하단)</option>
            </select>
        </Control>
        {textLayout === 'straight' ? (
            <Control label="텍스트 위치">
                <select value={textPosition} onChange={e => setTextPosition(e.target.value as any)} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 h-10 focus:ring-cyan-500 focus:border-cyan-500">
                    <option value="top-left">좌측 상단</option>
                    <option value="top-center">중앙 상단</option>
                    <option value="top-right">우측 상단</option>
                    <option value="middle-left">좌측 중앙</option>
                    <option value="middle-center">중앙</option>
                    <option value="middle-right">우측 중앙</option>
                    <option value="bottom-left">좌측 하단</option>
                    <option value="bottom-center">중앙 하단</option>
                    <option value="bottom-right">우측 하단</option>
                </select>
            </Control>
        ) : (
            <Control label="글자 간격">
                 <input type="range" min="5" max="50" value={letterSpacing} onChange={e => setLetterSpacing(parseInt(e.target.value))} className="w-full" />
            </Control>
        )}
         <Control label="텍스트 회전">
             <input type="range" min="-45" max="45" value={textRotation} disabled={textLayout !== 'straight'} onChange={e => setTextRotation(parseInt(e.target.value))} className="w-full disabled:opacity-50" />
        </Control>
        <Control label="텍스트 색상">
            <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full h-10 bg-gray-700 border-gray-600 rounded cursor-pointer" />
        </Control>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button onClick={handleSave} className="w-full" Icon={SaveIcon}>
          {isEditing ? '보관함에 업데이트' : '보관함에 저장'}
        </Button>
        <Button onClick={handleDownload} className="w-full" Icon={DownloadIcon} variant="secondary">
          PNG로 다운로드
        </Button>
      </div>
    </div>
  );
};

export default AlbumArtEditor;
