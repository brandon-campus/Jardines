interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
      <div className="text-5xl mb-3">{icon}</div>
      <div className="font-bold text-sm text-gray-400">{title}</div>
      {subtitle && <div className="text-xs text-gray-300 mt-1">{subtitle}</div>}
    </div>
  );
}
