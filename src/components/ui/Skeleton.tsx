import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    width?: string | number;
    height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = "",
    variant = "rounded",
    width,
    height
}) => {
    const baseClasses = "animate-pulse bg-gray-800/50";

    // Variant classes
    let variantClasses = "";
    switch (variant) {
        case 'circular':
            variantClasses = "rounded-full";
            break;
        case 'rectangular':
            variantClasses = "rounded-none";
            break;
        case 'rounded':
            variantClasses = "rounded-md";
            break;
        case 'text':
            variantClasses = "rounded h-4 w-full";
            break;
    }

    // Style object for arbitrary width/height
    const style: React.CSSProperties = {};
    if (width) style.width = width;
    if (height) style.height = height;

    return (
        <div
            className={`${baseClasses} ${variantClasses} ${className}`}
            style={style}
        />
    );
};
