interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const variants = {
  default: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-800' },
  success: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-800' },
  warning: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-800' },
  danger: { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', border: 'border-red-100 dark:border-red-800' },
  info: { bg: 'bg-violet-50 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-100 dark:border-violet-800' },
};

export default function StatCard({ title, value, icon, variant = 'default' }: StatCardProps) {
  const v = variants[variant];

  return (
    <div className={`${v.bg} ${v.border} border rounded-2xl p-5 shadow-card transition-all duration-300 hover:shadow-card-hover`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-theme-secondary">{title}</p>
          <p className="text-2xl font-bold text-theme-primary mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 ${v.bg} rounded-xl flex items-center justify-center ${v.text} text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
