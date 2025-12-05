import type { ReactNode } from 'react';
import { Activity, Square } from 'lucide-react';

export function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen relative flex flex-col font-sans">
            {/* Top Navigation Bar - Sticky, bordered */}
            <nav className="sticky top-0 z-50 bg-white border-b-2 border-black px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-swiss-red flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter uppercase">
                        ChartYap<span className="text-swiss-red">.V2</span>
                    </span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest">
                    <a href="#" className="hover:bg-black hover:text-white px-2 py-1 transition-colors">Manifesto</a>
                    <a href="#" className="hover:bg-black hover:text-white px-2 py-1 transition-colors">Grid</a>
                    <button className="px-6 py-2 bg-black text-white font-bold uppercase border-2 border-transparent hover:bg-white hover:text-black hover:border-black transition-all">
                        New Project
                    </button>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-[1600px] mx-auto border-x-2 border-black min-h-screen bg-swiss-offwhite relative">
                {/* Decorative Grid Lines */}
                <div className="absolute inset-y-0 left-12 w-px bg-black/10 pointer-events-none hidden xl:block" />
                <div className="absolute inset-y-0 right-12 w-px bg-black/10 pointer-events-none hidden xl:block" />

                <div className="p-8 md:p-12 lg:p-16">
                    {children}
                </div>
            </main>

            {/* Brutalist Footer */}
            <footer className="border-t-2 border-black bg-white p-12 mt-auto">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-6xl font-black mb-4 opacity-10 uppercase">Index</h2>
                        <div className="flex gap-2 text-xs font-mono">
                            <span>LAT: 41.0082</span>
                            <span>LNG: 28.9784</span>
                        </div>
                    </div>
                    <Square className="w-12 h-12 fill-black" />
                </div>
            </footer>
        </div>
    );
}
