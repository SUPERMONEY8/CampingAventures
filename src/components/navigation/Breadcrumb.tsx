/**
 * Breadcrumb Component
 * 
 * Breadcrumb navigation component with customizable separator,
 * truncation on mobile, and accessibility support.
 */

import { Link } from 'react-router-dom';
import { ChevronRight, type LucideIcon } from 'lucide-react';

/**
 * Breadcrumb item interface
 */
export interface BreadcrumbItem {
  /**
   * Item label
   */
  label: string;

  /**
   * Item href (optional for current page)
   */
  href?: string;

  /**
   * Optional icon
   */
  icon?: LucideIcon;
}

/**
 * Breadcrumb props
 */
export interface BreadcrumbProps {
  /**
   * Array of breadcrumb items
   */
  items: BreadcrumbItem[];

  /**
   * Custom separator component
   */
  separator?: React.ReactNode;

  /**
   * Maximum items to show before truncation
   * @default 3
   */
  maxItems?: number;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Breadcrumb Component
 */
export function Breadcrumb({
  items,
  separator,
  maxItems = 3,
  className = '',
}: BreadcrumbProps) {
  const defaultSeparator = <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />;
  const separatorElement = separator || defaultSeparator;

  // Truncate items on mobile if too many
  const shouldTruncate = items.length > maxItems;
  const displayItems = shouldTruncate
    ? [
        items[0], // First item
        { label: '...', href: undefined, icon: undefined }, // Ellipsis
        ...items.slice(-(maxItems - 1)), // Last items
      ]
    : items;

  return (
    <nav
      className={`flex items-center gap-2 text-sm ${className}`}
      aria-label="Fil d'Ariane"
    >
      <ol className="flex items-center gap-2 flex-wrap">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isEllipsis = item.label === '...';
          const Icon = item.icon;

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-2"
            >
              {isLast ? (
                // Current page (not clickable)
                <span
                  className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white truncate max-w-[200px] md:max-w-none"
                  aria-current="page"
                >
                  {Icon && (
                    <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  )}
                  <span className="truncate">{item.label}</span>
                </span>
              ) : isEllipsis ? (
                // Ellipsis
                <span className="text-gray-400 dark:text-gray-500" aria-hidden="true">
                  {item.label}
                </span>
              ) : (
                // Clickable breadcrumb item
                <>
                  <Link
                    to={item.href || '#'}
                    className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-smooth truncate max-w-[150px] md:max-w-none"
                  >
                    {Icon && (
                      <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    )}
                    <span className="truncate">{item.label}</span>
                  </Link>
                  {separatorElement}
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

