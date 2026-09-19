import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { getAdminProperties, adminRemoveProperty } from "../../services/adminService";
import { formatPrice } from "../../utils/format";
import Loader from "../../components/Loader";

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAdminProperties();
      setProperties(res.data);
    } catch (err) {
      toast.error("Could not load properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRemove = async (id) => {
    if (!window.confirm("Remove this property from the platform? This cannot be undone.")) return;
    try {
      await adminRemoveProperty(id);
      toast.success("Property removed");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not remove property");
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Properties</h1>
      <div className="card-surface overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-500 text-left">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Host</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p._id} className="border-t border-ink-100">
                <td className="px-4 py-3 font-medium">
                  <Link to={`/properties/${p._id}`} className="hover:text-brand-600">{p.title}</Link>
                </td>
                <td className="px-4 py-3 text-ink-600">{p.host?.name}</td>
                <td className="px-4 py-3 text-ink-500">{p.location.city}, {p.location.state}</td>
                <td className="px-4 py-3">{formatPrice(p.pricePerNight)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleRemove(p._id)} className="btn-outline text-xs py-1.5 px-3 text-red-600">
                    <Trash2 size={13} /> Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProperties;
