const PropertyCardSkeleton = () => (
  <div className="card-surface overflow-hidden">
    <div className="skeleton w-full h-48" />
    <div className="p-4 space-y-2">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
      <div className="skeleton h-4 w-1/3 mt-3" />
    </div>
  </div>
);

export default PropertyCardSkeleton;
