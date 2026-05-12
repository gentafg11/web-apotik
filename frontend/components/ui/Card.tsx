export default function Card({
  children,
  className = '',
  title,
  actions,
  gradient = false,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
  gradient?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg ${className} ${
        gradient ? 'bg-gradient-to-br from-white to-gray-50' : ''
      }`}
    >
      {(title || actions) && (
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
          {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
