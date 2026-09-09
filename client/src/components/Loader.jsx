import { Loader2 } from "lucide-react";

const Loader = ({ fullScreen = false, label = "Loading..." }) => {
  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-ink-500">
        <Loader2 className="animate-spin" size={32} />
        <p className="text-sm">{label}</p>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center py-8 text-ink-400">
      <Loader2 className="animate-spin" size={22} />
    </div>
  );
};

export default Loader;
