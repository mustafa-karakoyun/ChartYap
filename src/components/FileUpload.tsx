import { useState, useCallback } from 'react';
import { read, utils } from 'xlsx';
import { Loader2, ArrowDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface FileUploadProps {
    onDataLoaded: (data: any[], fileName: string) => void;
    onImageLoaded: (file: File) => void;
    className?: string;
}

export function FileUpload({ onDataLoaded, onImageLoaded, className }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const processFile = useCallback(async (file: File) => {
        setIsProcessing(true);

        if (file.type.startsWith('image/')) {
            setTimeout(() => {
                onImageLoaded(file);
                setIsProcessing(false);
            }, 800);
            return;
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = read(arrayBuffer);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = utils.sheet_to_json(worksheet);

            setTimeout(() => {
                onDataLoaded(jsonData, file.name);
                setIsProcessing(false);
            }, 1000);

        } catch (error) {
            console.error("Error reading file:", error);
            setIsProcessing(false);
        }
    }, [onDataLoaded, onImageLoaded]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    }, [processFile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            processFile(e.target.files[0]);
        }
    };

    return (
        <div className={cn("w-full max-w-2xl mx-auto", className)}>
            <div
                className={cn(
                    "relative overflow-hidden border-4 border-black transition-all duration-300",
                    isDragging
                        ? "bg-swiss-red text-white scale-[1.01] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-white hover:bg-swiss-offwhite shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]",
                    isProcessing && "pointer-events-none opacity-80"
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
            >
                <label className="relative flex flex-col items-center justify-center p-10 cursor-pointer h-full text-center">
                    <input
                        type="file"
                        className="hidden"
                        accept=".csv,.xlsx,.xls,.json,.png,.jpg,.jpeg"
                        onChange={handleChange}
                    />

                    {isProcessing ? (
                        <div className="flex flex-col items-center">
                            <Loader2 className="w-10 h-10 animate-spin mb-4" />
                            <h3 className="text-2xl font-black uppercase tracking-tighter">Processing...</h3>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="mb-6 border-2 border-current rounded-full p-4">
                                <ArrowDown className="w-8 h-8 animate-bounce" />
                            </div>

                            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-4">
                                Drop Data
                            </h3>
                            <p className="text-sm font-mono uppercase border-t-2 border-current pt-2">
                                .CSV / .XLSX / .PNG
                            </p>

                            <div className="mt-8 opacity-50 font-mono text-xs max-w-[180px] leading-tight">
                                Drag files here or click to browse system
                            </div>
                        </div>
                    )}
                </label>
            </div>

            <div className="flex justify-between mt-6 font-mono text-xs uppercase opacity-40">
                <span>Max Size: 50MB</span>
                <span>Secure Transfer</span>
            </div>
        </div>
    );
}
