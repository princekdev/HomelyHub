import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Pencil, Trash2, Plus } from "lucide-react";
import { getMyProperties, deleteProperty } from "../../services/propertyService";
import { formatPrice } from "../../utils/format";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";

const HostProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMyProperties();
      setProperties(res.data);
    } catch (err) {
      toast.error("Could not load your properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this property? This cannot be undone.")) return;
    try {
      await deleteProperty(id);
      toast.success("Property deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete property");
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Properties</h1>
        <Link to="/host/properties/new" className="btn-primary">
          <Plus size={16} /> Add Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <EmptyState
          title="No properties yet"
          message="Add your first property to start hosting on HomelyHub."
          action={<Link to="/host/properties/new" className="btn-primary">Add Property</Link>}
        />
      ) : (
        <div className="space-y-4">
          {properties.map((p) => (
            <div key={p._id} className="card-surface p-4 flex flex-col sm:flex-row gap-4">
              <img
                src={p.images?.[0]?.url}
                alt={p.title}
                className="w-full sm:w-40 h-32 object-cover rounded-xl"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link to={`/properties/${p._id}`} className="font-semibold hover:text-brand-600">{p.title}</Link>
                    <p className="text-xs text-ink-500 mt-1">{p.location.city}, {p.location.state}</p>
                  </div>
                  <span className={`badge ${p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-ink-200 text-ink-600"}`}>
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="font-medium mt-2">{formatPrice(p.pricePerNight)} <span className="text-ink-500 text-sm font-normal">/ night</span></p>
                <div className="flex gap-2 mt-3">
                  <Link to={`/host/properties/${p._id}/edit`} className="btn-outline text-sm py-1.5 px-3">
                    <Pencil size={14} /> Edit
                  </Link>
                  <button onClick={() => handleDelete(p._id)} className="btn-outline text-sm py-1.5 px-3 text-red-600">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HostProperties;
