import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { DualUploader } from './components/DualUploader';
import { ChartGrid } from './components/ChartGrid';
import { generateSuggestions, type ChartSuggestion } from './lib/analyzer';
import { analyzeImage } from './lib/vision';
import { ScanEye, CheckCircle2 } from 'lucide-react';

function App() {
  const [suggestions, setSuggestions] = useState<ChartSuggestion[]>([]);

  // Data State
  const [uploadedData, setUploadedData] = useState<any[] | null>(null);
  const [dataFileName, setDataFileName] = useState<string>("");

  // Image State
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [detectedStyle, setDetectedStyle] = useState<string | null>(null);

  // Process Trigger
  useEffect(() => {
    if (uploadedData) {
      // If we have data, generate charts. 
      // If we also have a detected style (from image), pass it as preference.
      const newSuggestions = generateSuggestions(uploadedData, detectedStyle || undefined);
      setSuggestions(newSuggestions);
    }
  }, [uploadedData, detectedStyle]);

  const handleDataLoaded = (jsonData: any[], name: string) => {
    setUploadedData(jsonData);
    setDataFileName(name);
  };

  const handleImageLoaded = async (file: File) => {
    setAnalyzingImage(true);
    setDetectedStyle(null);

    // Analyze image to find chart type
    const result = await analyzeImage(file);

    setDetectedStyle(result.detectedType);
    setAnalyzingImage(false);
  };

  return (
    <Layout>
      <div className="space-y-16">

        {/* Header */}
        <section className="border-b-4 border-black pb-12">
          <h1 className="text-[10vw] leading-[0.85] font-black uppercase tracking-tighter mix-blend-multiply text-black mb-8">
            Style<br />
            <span className="text-swiss-red">Matcher</span><br />
            Engine_
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start border-t-2 border-black pt-8">
            <p className="text-xl md:text-2xl font-bold uppercase leading-tight max-w-md">
              Upload Data + Target Style. <br />
              We build the bridge.
            </p>
            <div className="font-mono text-sm leading-relaxed opacity-60">
              SYSTEM STATUS: READY<br />
              MODE: DUAL_INPUT<br />
              V.2.1.0 (MATCH_PROTO)
            </div>
          </div>
        </section>

        {/* Dual Input Section */}
        <section>
          <DualUploader
            onDataLoaded={handleDataLoaded}
            onImageLoaded={handleImageLoaded}
            dataStatus={uploadedData ? 'done' : 'idle'}
            imageStatus={analyzingImage ? 'processing' : (detectedStyle ? 'done' : 'idle')}
          />
        </section>

        {/* Status / Matching Feedback */}
        {(uploadedData || detectedStyle) && (
          <div className="border-2 border-black bg-swiss-offwhite p-6 flex flex-col md:flex-row justify-between items-center gap-4">

            <div className="flex items-center gap-4">
              {/* Data Status */}
              <div className={`flex items-center gap-2 ${uploadedData ? 'opacity-100' : 'opacity-30'}`}>
                <CheckCircle2 className="w-6 h-6" />
                <span className="font-bold uppercase">Data: {dataFileName || "Waiting..."}</span>
              </div>

              <span className="opacity-20">|</span>

              {/* Style Status */}
              <div className={`flex items-center gap-2 ${detectedStyle ? 'opacity-100' : (analyzingImage ? 'opacity-100' : 'opacity-30')}`}>
                {analyzingImage ? <ScanEye className="w-6 h-6 animate-spin" /> : <ScanEye className="w-6 h-6" />}
                <div className="flex flex-col">
                  <span className="font-bold uppercase">Target Style: {analyzingImage ? "Scanning..." : (detectedStyle || "Waiting...")}</span>
                  {detectedStyle && <span className="text-xs font-mono text-swiss-red">Type Detected</span>}
                </div>
              </div>
            </div>

            {uploadedData && detectedStyle && (
              <div className="bg-black text-white px-4 py-1 font-mono text-xs uppercase animate-pulse">
                Syncing Data Model with Visual Schema...
              </div>
            )}
          </div>
        )}

        {/* Results Grid */}
        <section>
          {suggestions.length > 0 && <ChartGrid suggestions={suggestions} />}
        </section>

      </div>
    </Layout>
  );
}

export default App;
