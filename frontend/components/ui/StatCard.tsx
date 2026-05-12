interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const variants = {
  default: 'bg-blue-50 border-blue-100 text-blue-600',
  success: 'bg-green-50 border-green-100 text-green-600',
  warning: 'bg-yellow-50 border-yellow-100 text-yellow-600',
  danger: 'bg-red-50 border-red-100 text-red-600',
  info: 'bg-purple-50 border-purple-100 text-purple-600',
};

export default function StatCard({ title, value, icon, variant = 'default' }: StatCardProps) {
  return (
    <div className={`${variants[variant]} border rounded-xl p-5 shadow-soft`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}