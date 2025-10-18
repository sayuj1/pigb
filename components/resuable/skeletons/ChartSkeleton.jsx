import React from "react";
import { Skeleton } from "antd";

/**
 * Reusable skeleton for chart cards.
 * Props:
 * - title (boolean): whether to show title skeleton
 * - bars (number): number of horizontal bar placeholders
 * - pie (boolean): show circular/pie chart placeholder
 */
export default function ChartSkeleton({ title = true, bars = 4, pie = false }) {
    return (
        <div className="bg-white rounded-lg shadow p-6 w-full">
            {title && <Skeleton.Input active size="default" style={{ width: 220, marginBottom: 24 }} />}

            {/* Simulate bars */}
            <div className="space-y-4">
                {Array.from({ length: bars }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton.Input
                            active
                            size="small"
                            style={{ width: 100, height: 20, borderRadius: 4 }}
                        />
                        <Skeleton.Input
                            active
                            size="small"
                            block
                            style={{ height: 20, borderRadius: 4 }}
                        />
                    </div>
                ))}
            </div>

            {pie && (
                <div className="flex justify-center items-center mt-8">
                    <div className="w-40 h-40 rounded-full bg-gray-200 animate-pulse" />
                </div>
            )}
        </div>
    );
}
