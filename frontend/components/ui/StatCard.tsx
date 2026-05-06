interface StatCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const colors = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', iconBg: 'bg-blue-100' },
  green: { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-600', iconBg: 'bg-green-100' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-100', text: 'text-yellow-600', iconBg: 'bg-yellow-100' },
  red: { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600', iconBg: 'bg-red-100' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-600', iconBg: 'bg-purple-100' },
};

export default function StatCard({ title, value, change, icon, color = 'blue' }: StatCardProps) {
  const c = colors[color];
  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {change !== undefined && (
            <p className={`text-sm mt-1 ${change >= 0 ? c.text : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}% dari bulan lalu
            </p>
          )}
        </div>
        <div className={`${c.iconBg} p-4 rounded-xl ${c.text}`}>{icon}</div>
      </div>
    </div>
  );
}
