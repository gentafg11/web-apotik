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
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          {children}
        </table>
      </div>
      <BackToTop />
    </div>
  );
}

export const Table = ({ children, className = '', ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
  <table className={`min-w-full divide-y divide-gray-200 ${className}`} {...props}>
    {children}
  </table>
);

export const TableHead = ({ children }: { children: ReactNode }) => (
  <thead className="bg-gray-50">{children}</thead>
);

export const TableRow = ({ children, className = '', ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={`hover:bg-gray-50 transition-colors ${className}`} {...props}>
    {children}
  </tr>
);

export const TableHeader = ({ children, className = '', ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={`px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${className}`} {...props}>
    {children}
  </th>
);

export const TableCell = ({ children, className = '', ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 ${className}`} {...props}>
    {children}
  </td>
);