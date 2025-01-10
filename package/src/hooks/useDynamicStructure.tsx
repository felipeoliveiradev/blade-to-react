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
): Array<Record<string, string>> => {
    return useMemo(() => {
        const sections: Array<Record<string, string>> = [];

        const processChildren = (child: ComponentChild, basePath: string = componentName) => {
            if (child.type === `${basePath}.section`) {
                const sectionData: Record<string, string> = {};

                // Collect all child types and their content within this section
                child.children?.forEach(subChild => {
                    if (subChild.type.startsWith(`${basePath}.`)) {
                        const key = subChild.type.split('.')[1]; // e.g., 'header' from 'tab.header'
                        sectionData[key] = subChild.slots?.__default || '';
                    }
                });

                // Only add if we found at least one child within the section
                if (Object.keys(sectionData).length > 0) {
                    sections.push(sectionData);
                }
            }
        };

        children.forEach(child => processChildren(child));

        return sections;
    }, [componentName, children]);
};