import React, { useMemo, useCallback, memo } from 'react';

interface OptimizationProps {
    dependencies?: any[];
    callbackDependencies?: any[];
    memoizeComponent?: boolean;
}

export function useAllOptimizations<T extends (...args: any[]) => any>(
    WrappedComponent: React.ComponentType<any>,
    options: OptimizationProps = {}
): React.ComponentType<any> {
    const { dependencies = [], callbackDependencies = [], memoizeComponent = true } = options;

    return function OptimizedComponent(props: any) {
        // Memoize props if they have dependencies
        const optimizedProps = useMemo(() => props, dependencies);

        // Memoize the callback if dependencies are provided
        const memoizedCallback = useCallback(() => {
            // Placeholder for any callback logic
        }, callbackDependencies);

        // Memoize the component itself if needed
        const MemoizedComponent = memoizeComponent ? memo(WrappedComponent) : WrappedComponent;

        return <MemoizedComponent {...optimizedProps} />;
    };
}