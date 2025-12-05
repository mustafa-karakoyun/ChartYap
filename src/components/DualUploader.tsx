import { useState, useCallback } from 'react';
import { read, utils } from 'xlsx';
import { Loader2, Database, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface DualUploaderProps {
    onDataLoaded: (data: any[], fileName: string) => void;
    onImageLoaded: (file: File) => void;
    className?: string;
    dataStatus?: 'idle' | 'processing' | 'done';
    imageStatus?: 'idle' | 'processing' | 'done';
}

export function DualUploader({
    onDataLoaded,
    onImageLoaded,
    className,
    dataStatus = 'idle',
    imageStatus = 'idle'
}: DualUploaderProps) {
    const [dragActiveData, setDragActiveData] = useState(false);
    const [dragActiveImage, setDragActiveImage] = useState(false);

    // --- Data Handling ---
    const processDataFile = async (file: File) => {
        if (!file.name.match(/\.(xlsx|xls|csv|json)$/)) return;
        try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = read(arrayBuffer);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = utils.sheet_to_json(worksheet);
            onDataLoaded(jsonData, file.name);
        } catch (error) {
            console.error("Error reading data file:", error);
        }
    };

    const handleDataDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragActiveData(false);
        if (e.dataTransfer.files?.[0]) processDataFile(e.dataTransfer.files[0]);
    }, [onDataLoaded]);

    // --- Image Handling ---
    const processImageFile = (file: File) => {
        if (!file.type.startsWith('image/')) return;
        onImageLoaded(file);
    };

    const handleImageDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragActiveImage(false);
        if (e.dataTransfer.files?.[0]) processImageFile(e.dataTransfer.files[0]);
    }, [onImageLoaded]);

    // --- Generic Handlers ---
    const handleDrag = (setDrag: (v: boolean) => void) => (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDrag(true);
        else if (e.type === "dragleave") setDrag(false);
    };

    return (
        <div className={cn("flex flex-row items-center gap-4 w-full max-w-3xl mx-auto", className)}>

            {/* LEFT: DATA INPUT */}
            <div
                className={cn(
                    "relative w-full min-h-[300px] border-4 border-black transition-all duration-300 flex flex-col items-center justify-center p-4 text-center",
                    dragActiveData ? "bg-swiss-red text-white scale-[1.02]" : "bg-white hover:bg-swiss-offwhite",
                    dataStatus === 'done' && "bg-black text-white"
                )}
                onDragEnter={handleDrag(setDragActiveData)}
                onDragLeave={handleDrag(setDragActiveData)}
                onDragOver={handleDrag(setDragActiveData)}
                onDrop={handleDataDrop}
            >
                <input
                    type="file"
                    id="data-upload"
                    className="hidden"
                    accept=".xlsx,.xls,.csv,.json"
                    onChange={(e) => e.target.files?.[0] && processDataFile(e.target.files[0])}
                    disabled={dataStatus === 'processing'}
                />

                <label htmlFor="data-upload" className="absolute inset-0 cursor-pointer" />

                {dataStatus === 'processing' ? (
                    <Loader2 className="w-10 h-10 animate-spin mb-3" />
                ) : (
                    <Database className="w-10 h-10 mb-3" />
                )}

                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-2 leading-none">
                    {dataStatus === 'done' ? 'Data Loaded' : '1. Data'}
                </h3>
                <p className="font-mono text-[10px] md:text-xs uppercase opacity-70">
                    Excel / CSV
                </p>
            </div>

            {/* CENTER: CONNECTOR */}
            <div className="flex flex-col justify-center items-center pointer-events-none shrink-0">
                <ArrowRight className="w-6 h-6" />
            </div>

            {/* RIGHT: IMAGE INPUT */}
            <div
                className={cn(
                    "relative w-full min-h-[300px] border-4 border-black transition-all duration-300 flex flex-col items-center justify-center p-4 text-center",
                    dragActiveImage ? "bg-swiss-red text-white scale-[1.02]" : "bg-white hover:bg-swiss-offwhite",
                    imageStatus === 'done' && "bg-black text-white"
                )}
                onDragEnter={handleDrag(setDragActiveImage)}
                onDragLeave={handleDrag(setDragActiveImage)}
                onDragOver={handleDrag(setDragActiveImage)}
                onDrop={handleImageDrop}
            >
                <input
                    type="file"
                    id="image-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && processImageFile(e.target.files[0])}
                    disabled={imageStatus === 'processing'}
                />

                <label htmlFor="image-upload" className="absolute inset-0 cursor-pointer" />

                {imageStatus === 'processing' ? (
                    <Loader2 className="w-10 h-10 animate-spin mb-3" />
                ) : (
                    <ImageIcon className="w-10 h-10 mb-3" />
                )}

                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-2 leading-none">
                    {imageStatus === 'done' ? 'Scanned' : '2. Style'}
                </h3>
                <p className="font-mono text-[10px] md:text-xs uppercase opacity-70">
                    Image Target
                </p>
            </div>
        </div>
    );
}
