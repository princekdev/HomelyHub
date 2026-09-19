import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import PropertyForm from "../../components/PropertyForm";
import { getPropertyById, updateProperty } from "../../services/propertyService";
import Loader from "../../components/Loader";
import ErrorState from "../../components/ErrorState";

const EditProperty = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getPropertyById(id);
        setProperty(res.data);
      } catch (err) {
        setError("Could not load this property");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await updateProperty(id, formData);
      toast.success("Property updated successfully");
      navigate(`/properties/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update property");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (error || !property) return <ErrorState message={error} />;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Edit Property</h1>
      <PropertyForm
        initialValues={property}
        existingImages={property.images}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Save Changes"
      />
    </div>
  );
};

export default EditProperty;
