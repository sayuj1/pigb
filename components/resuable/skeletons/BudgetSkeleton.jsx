import React from 'react'
import { Skeleton } from 'antd'

const BudgetSkeleton = () => {
    return (
        <div className="space-y-6 mt-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-md bg-gray-50 animate-pulse"
                >
                    <div className="w-6 h-6 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton.Input active size="small" style={{ width: "50%" }} />
                        <Skeleton.Input active size="small" block />
                        <Skeleton.Input active size="small" style={{ width: "40%" }} />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default BudgetSkeleton