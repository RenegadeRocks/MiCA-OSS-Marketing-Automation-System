import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helperText?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, helperText, error, leftIcon, rightIcon, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
              block w-full rounded-lg border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
              ${leftIcon ? 'pl-10' : 'px-3'}
              ${rightIcon ? 'pr-10' : 'px-3'}
              py-2
              ${error
                                ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
                            }
              ${className}
            `}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error ? (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                ) : helperText ? (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
                ) : null}
            </div>
        );
    }
);

Input.displayName = 'Input';
