import { useRef, useEffect } from 'react';
import embed from 'vega-embed';
import type { TopLevelSpec } from 'vega-lite';
import { Maximize2, Download, BarChart2, Table } from 'lucide-react';
import type { ChartSuggestion } from '../lib/analyzer';

interface ChartCardProps {
    suggestion: ChartSuggestion;
}

export function ChartCard({ suggestion }: ChartCardProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current && suggestion.vega_lite_code) {
            const spec: TopLevelSpec = {
                ...suggestion.vega_lite_code,
                width: "container",
                height: 200,
                background: "transparent",
                config: {
                    // Light Theme Config
                    background: "white",
                    axis: {
                        domainColor: "#000",
                        tickColor: "#000",
                        titleColor: "#000",
                        labelColor: "#000",
                        gridColor: "#eee",
                        labelFont: "Inter",
                        titleFont: "Inter",
                        titleFontWeight: "bold"
                    },
                    legend: {
                        labelColor: "#000",
                        titleColor: "#000",
                        labelFont: "Inter",
                        titleFont: "Inter"
                    },
                    title: {
                        color: "#000",
                        font: "Inter",
                        fontWeight: 900,
                        fontSize: 16
                    },
                    view: { stroke: "transparant" }
                }
            };

            embed(containerRef.current, spec, { actions: false, renderer: 'svg' })
                .catch(console.error);
        }
    }, [suggestion]);

    return (
        <div className="relative flex flex-col h-full bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all overflow-hidden group">
            {/* Header - Brutalist Block */}
            <div className="bg-black text-white p-3 flex justify-between items-start">
                <div>
                    <span className="inline-block text-[10px] uppercase font-bold tracking-widest bg-swiss-red text-white px-2 py-0.5 mb-2">
                        {suggestion.best_chart_type}
                    </span>
                    <h3 className="text-lg font-bold uppercase leading-none tracking-tight">
                        {suggestion.title}
                    </h3>
                </div>
                <BarChart2 className="w-4 h-4 text-white/50" />
            </div>

            {/* Chart Area */}
            <div className="flex-1 relative min-h-[200px] p-4 bg-white">
                <div ref={containerRef} className="w-full h-full" />

                {/* Action Bar - visible on hover */}
                <div className="absolute right-0 bottom-0 flex border-t-2 border-l-2 border-black opacity-0 group-hover:opacity-100 transition-opacity bg-white">
                    <button className="p-2 hover:bg-black hover:text-white transition-colors border-r-2 border-black last:border-r-0">
                        <Maximize2 className="w-3 h-3" />
                    </button>
                    <button className="p-2 hover:bg-black hover:text-white transition-colors">
                        <Download className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Footer - Metrics */}
            <div className="p-3 border-t-2 border-black bg-swiss-offwhite flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                <div className="flex gap-2">
                    {suggestion.columns_used.slice(0, 3).map(col => (
                        <span key={col} className="border border-black/20 px-1 bg-white">
                            {col}
                        </span>
                    ))}
                </div>
                <div className="flex items-center gap-1">
                    <Table className="w-3 h-3" /> Data
                </div>
            </div>
        </div>
    );
}
