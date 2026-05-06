import React from 'react';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export const Table = ({ children, className = '', ...props }: TableProps) => (
  <div className="overflow-x-auto rounded-xl shadow-soft border border-gray-100">
    <table {...props} className={`min-w-full divide-y divide-gray-200 ${className}`}>
      {children}
    </table>
  </div>
);

export const TableHead = ({ children }: { children: React.ReactNode }) => (
  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">{children}</thead>
);

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}
export const TableRow = ({ children, className = '', ...props }: TableRowProps) => (
  <tr {...props} className={`hover:bg-gray-50 transition-colors duration-150 ${className}`}>
    {children}
  </tr>
);

interface TableHeaderProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}
export const TableHeader = ({ children, className, ...props }: TableHeaderProps) => (
  <th
    {...props}
    className={`px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${className}`}
  >
    {children}
  </th>
);

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}
export const TableCell = ({ children, className, ...props }: TableCellProps) => (
  <td {...props} className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 ${className}`}>
    {children}
  </td>
);
