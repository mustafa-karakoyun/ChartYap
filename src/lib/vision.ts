export interface VisionAnalysisResult {
    detectedType: string;
    confidence: number;
    generatedData: any[];
    summary: string;
}

// Helper to generate random data based on chart type
function generateSyntheticData(type: string): any[] {
    const categories = ['Elektronik', 'Giyim', 'Ev Dekorasyon', 'Kitap', 'Spor'];
    const regions = ['Marmara', 'Ege', 'İç Anadolu', 'Akdeniz', 'Karadeniz'];
    const months = Array.from({ length: 12 }, (_, i) => new Date(2025, i, 1).toISOString());

    // Generate different data shapes based on detected type
    if (type.toLowerCase().includes('bar') || type.toLowerCase().includes('column') || type.toLowerCase().includes('radial')) {
        return categories.map(cat => ({
            Category: cat,
            Value: Math.floor(Math.random() * 1000) + 200,
            Region: regions[Math.floor(Math.random() * regions.length)]
        }));
    }

    if (type.toLowerCase().includes('line') || type.toLowerCase().includes('area')) {
        return months.map((date, i) => ({
            Date: date,
            Value: Math.floor(Math.random() * 500) + (i * 20),
            Trend: Math.floor(Math.random() * 100)
        }));
    }

    if (type.toLowerCase().includes('scatter') || type.toLowerCase().includes('bubble')) {
        return Array.from({ length: 30 }, (_, i) => ({
            id: i,
            X_Value: Math.floor(Math.random() * 100),
            Y_Value: Math.floor(Math.random() * 100),
            Size: Math.floor(Math.random() * 50) + 10,
            Group: categories[i % categories.length]
        }));
    }

    // Default generic data
    return categories.map(cat => ({
        Category: cat,
        Value: Math.floor(Math.random() * 1000)
    }));
}

export async function analyzeImage(file: File): Promise<VisionAnalysisResult> {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate detection logic (includes new types)
            const possibleTypes = [
                'Bar Chart', 'Line Chart', 'Scatter Plot', 'Pie Chart', 'Heatmap',
                'Density Plot', 'Area Chart', 'Radial Bar Chart', 'Pyramid Chart'
            ];
            // Hash filename to get consistent result for same file
            const hash = file.name.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
            const detectedType = possibleTypes[Math.abs(hash) % possibleTypes.length];

            const data = generateSyntheticData(detectedType);

            resolve({
                detectedType,
                confidence: 0.85 + (Math.random() * 0.14),
                generatedData: data,
                summary: `Detected ${detectedType} with ${data.length} data points.`
            });
        }, 1500); // 1.5s delay for "AI Processing" feel
    });
}
