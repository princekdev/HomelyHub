import { Star } from "lucide-react";

const RatingStars = ({ rating = 0, size = 14, interactive = false, onChange }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-0.5">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange && onChange(s)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            size={size}
            className={s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-ink-200 text-ink-200"}
          />
        </button>
      ))}
    </div>
  );
};

export default RatingStars;
