// hooks/useDynamicComponent.ts
import { useMemo } from 'react';

interface ComponentChild {
    type: string;
    props: any;
    slots?: Record<string, string>;
    children?: ComponentChild[];
}

export const useDynamicComponent = (
    componentName: string,
    children: ComponentChild[] = []
): Record<string, any[]> => {
    return useMemo(() => {
        const result: Record<string, any[]> = {};

        // Helper function to find specific child type
        const findChildByType = (children: ComponentChild[], type: string): ComponentChild | undefined => {
            return children.find(child => child.type === `${componentName}.${type}`);
        };

        children.forEach((child) => {
            if (child.type === `${componentName}.section`) {
                // For each type of child within a section, process it
                child.children?.forEach(subChild => {
                    const typeKey = subChild.type.split('.')[1]; // Assumes naming like 'tab.header', gets 'header'
                    if (!result[typeKey]) {
                        result[typeKey] = [];
                    }

                    result[typeKey].push(subChild.slots?.__default || '');
                });
            }
        });

        return result;
    }, [componentName, children]);
};