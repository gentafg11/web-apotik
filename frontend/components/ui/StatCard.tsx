interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const variants = {
  default: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  success: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
  danger: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
  info: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' },
};

export default function StatCard({ title, value, icon, variant = 'default' }: StatCardProps) {
  const v = variants[variant];
  
  return (
    <div className={`${v.bg} ${v.border} border rounded-2xl p-5 shadow-card transition-all duration-300 hover:shadow-card-hover`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 ${v.bg} rounded-xl flex items-center justify-center ${v.text} text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}