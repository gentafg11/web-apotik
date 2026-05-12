'use client';

import { ReactNode } from 'react';
import BackToTop from './BackToTop';

interface TableWrapperProps {
  children: ReactNode;
  className?: string;
}

export function TableWrapper({ children, className = '' }: TableWrapperProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="overflow-x-auto rounded-xl border border-theme">
        <table className="min-w-full divide-y divide-theme">
          {children}
        </table>
      </div>
      <BackToTop />
    </div>
  );
}

export const Table = ({ children, className = '', ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
  <table className={`min-w-full divide-y divide-theme ${className}`} {...props}>
    {children}
  </table>
);

export const TableHead = ({ children }: { children: ReactNode }) => (
  <thead className="bg-theme-tertiary/30">{children}</thead>
);

export const TableRow = ({ children, className = '', ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={`hover:bg-theme-tertiary/30 transition-colors ${className}`} {...props}>
    {children}
  </tr>
);

export const TableHeader = ({ children, className = '', ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={`px-6 py-3 text-left text-xs font-semibold text-theme-secondary uppercase tracking-wider ${className}`} {...props}>
    {children}
  </th>
);

export const TableCell = ({ children, className = '', ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={`px-6 py-4 text-sm text-theme-primary ${className}`} {...props}>
    {children}
  </td>
);
