import { Inbox } from 'lucide-react';

export default function EmptyState({ title, message }) {
  return (
    <div className="grid min-h-[220px] place-items-center rounded-md border border-dashed border-line bg-white p-8 text-center">
      <div>
        <Inbox className="mx-auto mb-3 text-slate-400" size={34} aria-hidden="true" />
        <h3 className="font-semibold text-ink">{title}</h3>
        <p className="mt-1 max-w-md text-sm text-slate-500">{message}</p>
      </div>
    </div>
  );
}
