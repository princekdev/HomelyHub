import { SearchX } from "lucide-react";

const EmptyState = ({ title = "Nothing here yet.", message = "", icon: Icon = SearchX, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-4">
    <div className="p-4 rounded-full bg-ink-100 text-ink-400 mb-4">
      <Icon size={28} />
    </div>
    <h3 className="font-semibold text-ink-800 text-lg">{title}</h3>
    {message && <p className="text-ink-500 text-sm mt-1 max-w-sm">{message}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
