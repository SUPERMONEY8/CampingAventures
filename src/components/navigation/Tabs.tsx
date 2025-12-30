/**
 * Tabs Component
 * 
 * Advanced tabs component with animated underline indicator,
 * horizontal scroll on mobile, and keyboard navigation.
 */

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

/**
 * Tab item interface
 */
export interface TabItem {
  /**
   * Tab ID (unique identifier)
   */
  id: string;

  /**
   * Tab label
   */
  label: string;

  /**
   * Optional icon
   */
  icon?: LucideIcon;

  /**
   * Optional badge count
   */
  badge?: number;

  /**
   * Disabled state
   */
  disabled?: boolean;
}

/**
 * Tabs props
 */
export interface TabsProps {
  /**
   * Array of tab items
   */
  tabs: TabItem[];

  /**
   * Active tab ID
   */
  activeTab: string;

  /**
   * Change handler
   */
  onChange: (tabId: string) => void;

  /**
   * Full width tabs
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Tabs Component
 */
export function Tabs({
  tabs,
  activeTab,
  onChange,
  fullWidth = false,
  className = '',
}: TabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  /**
   * Update indicator position
   */
  useEffect(() => {
    if (!activeTabRef.current || !tabsRef.current) return;

    const activeTabElement = activeTabRef.current;
    const tabsContainer = tabsRef.current;

    const updateIndicator = (): void => {
      const tabRect = activeTabElement.getBoundingClientRect();
      const containerRect = tabsContainer.getBoundingClientRect();

      setIndicatorStyle({
        left: tabRect.left - containerRect.left + tabsContainer.scrollLeft,
        width: tabRect.width,
      });
    };

    updateIndicator();

    // Update on resize
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeTab, tabs]);

  /**
   * Scroll active tab into view on mobile
   */
  useEffect(() => {
    if (activeTabRef.current && tabsRef.current) {
      const tabElement = activeTabRef.current;
      const container = tabsRef.current;

      const tabLeft = tabElement.offsetLeft;
      const tabWidth = tabElement.offsetWidth;
      const containerWidth = container.offsetWidth;
      const scrollLeft = container.scrollLeft;

      // Check if tab is out of view
      if (tabLeft < scrollLeft) {
        container.scrollTo({ left: tabLeft - 16, behavior: 'smooth' });
      } else if (tabLeft + tabWidth > scrollLeft + containerWidth) {
        container.scrollTo({
          left: tabLeft + tabWidth - containerWidth + 16,
          behavior: 'smooth',
        });
      }
    }
  }, [activeTab]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();

      const direction = e.key === 'ArrowLeft' ? -1 : 1;
      let newIndex = index + direction;

      // Find next enabled tab
      while (newIndex >= 0 && newIndex < tabs.length) {
        if (!tabs[newIndex].disabled) {
          onChange(tabs[newIndex].id);
          // Focus the new tab
          setTimeout(() => {
            const newTabElement = tabsRef.current?.querySelector(
              `[data-tab-id="${tabs[newIndex].id}"]`
            ) as HTMLButtonElement;
            newTabElement?.focus();
          }, 0);
          break;
        }
        newIndex += direction;
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      const firstEnabled = tabs.findIndex((tab) => !tab.disabled);
      if (firstEnabled !== -1) {
        onChange(tabs[firstEnabled].id);
      }
    } else if (e.key === 'End') {
      e.preventDefault();
      // Find last enabled tab
      let lastEnabled = -1;
      for (let i = tabs.length - 1; i >= 0; i--) {
        if (!tabs[i].disabled) {
          lastEnabled = i;
          break;
        }
      }
      if (lastEnabled !== -1) {
        onChange(tabs[lastEnabled].id);
      }
    }
  };

  const activeTabIndex = tabs.findIndex((tab) => tab.id === activeTab);

  return (
    <div className={`relative ${className}`}>
      {/* Tabs Container */}
      <div
        ref={tabsRef}
        className={`
          flex
          overflow-x-auto
          scrollbar-hide
          border-b
          border-gray-200
          dark:border-gray-700
          ${fullWidth ? 'w-full' : ''}
          snap-x snap-mandatory
          -mx-4 px-4
        `}
        role="tablist"
        aria-label="Navigation par onglets"
      >
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              ref={isActive ? activeTabRef : null}
              data-tab-id={tab.id}
              onClick={() => !tab.disabled && onChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              disabled={tab.disabled}
              className={`
                relative
                flex
                items-center
                gap-2
                px-4
                py-3
                min-h-[44px]
                font-semibold
                text-sm
                md:text-base
                transition-smooth
                touch-manipulation
                whitespace-nowrap
                flex-shrink-0
                ${fullWidth ? 'flex-1 justify-center' : ''}
                ${
                  isActive
                    ? 'text-primary dark:text-primary'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }
                ${
                  tab.disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800'
                }
                focus:outline-none
                focus:ring-2
                focus:ring-primary
                focus:ring-offset-2
                dark:focus:ring-offset-gray-900
              `}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
            >
              {Icon && (
                <Icon
                  className={`w-4 h-4 md:w-5 md:h-5 ${
                    isActive ? 'text-primary' : 'text-current'
                  }`}
                  aria-hidden="true"
                />
              )}
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`
                    ml-1
                    px-2
                    py-0.5
                    text-xs
                    font-bold
                    rounded-full
                    ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Animated Underline Indicator */}
      {activeTabIndex !== -1 && (
        <motion.div
          className="absolute bottom-0 h-0.5 bg-primary"
          initial={false}
          animate={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 300,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

