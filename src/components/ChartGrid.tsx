import type { ChartSuggestion } from '../lib/analyzer';
import { ChartCard } from './ChartCard';

export function ChartGrid({ suggestions }: { suggestions: ChartSuggestion[] }) {
    if (suggestions.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 duration-700 delay-200">
            {suggestions.map((suggestion, idx) => (
                <div key={suggestion.id} className="h-full" style={{ animationDelay: `${idx * 100}ms` }}>
                    <ChartCard suggestion={suggestion} />
                </div>
            ))}
        </div>
    );
}
