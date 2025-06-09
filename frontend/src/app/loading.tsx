// app/loading.tsx (Global loading)
import React from 'react';

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-[#1a1a2e]/90 backdrop-blur-md rounded-2xl shadow-[0_4px_30px rgba(0, 0, 0, 0.4)] p-8 border border-white/30">
                <div className="flex flex-col items-center space-y-4">
                    {/* Spinner */}
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>

                    {/* Loading text */}
                    <p className="text-white text-lg font-medium">Loading page...</p>
                </div>
            </div>
        </div>
    );
}