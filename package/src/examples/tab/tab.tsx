import React, { useState, useEffect, useMemo } from 'react';
import { useDynamicComponent } from "../../hooks"; // Adjust the path accordingly

interface ComponentChild {
    type: string;
    props: any;
    slots?: Record<string, string>;
    children?: ComponentChild[];
}

interface TabProps {
    slots?: Record<string, string>;
    children?: ComponentChild[];
}

const styles = {
    container: 'w-full flex flex-col gap-4 border rounded-lg p-4 shadow-sm',
    header: 'text-xl font-semibold mb-4',
    navigation: 'flex border-b',
    navButton: `px-4 py-2 font-medium transition-colors duration-200 ease-in-out
        hover:text-blue-600 hover:bg-blue-50 rounded-t-lg`,
    activeNavButton: 'border-b-2 border-blue-500 text-blue-600 bg-blue-50',
    content: 'py-4',
    footer: 'mt-4 pt-4 border-t text-gray-600'
};

const Tab: React.FC<TabProps> = ({ slots = {}, children = [] }) => {
    const [activeTabIndex, setActiveTabIndex] = useState(0);

    // Debug log
    useEffect(() => {
        console.log('Tab mounted with:', { slots, children });
    }, [slots, children]);

    const dynamicData = useDynamicComponent("tab", children);
    const headers = dynamicData['header'] || [];
    const contents = dynamicData['content'] || [];

    return (
        <div className={styles.container}>
            {slots.header && (
                <div
                    className={styles.header}
                    dangerouslySetInnerHTML={{ __html: slots.header }}
                />
            )}

            {/* Tab Navigation */}
            <div className={styles.navigation}>
                {headers.map((header, index) => (
                    <button
                        key={index}
                        className={`${styles.navButton} ${index === activeTabIndex ? styles.activeNavButton : ''}`}
                        onClick={() => setActiveTabIndex(index)}
                        dangerouslySetInnerHTML={{ __html: header }}
                    />
                ))}
            </div>

            {/* Content */}
            {contents[activeTabIndex] && (
                <div
                    className={styles.content}
                    dangerouslySetInnerHTML={{ __html: contents[activeTabIndex] }}
                />
            )}

            {/* Global Footer */}
            {slots.footer && (
                <div
                    className={styles.footer}
                    dangerouslySetInnerHTML={{ __html: slots.footer }}
                />
            )}
        </div>
    );
};

export default Tab;