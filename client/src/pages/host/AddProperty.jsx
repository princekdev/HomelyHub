import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PropertyForm from "../../components/PropertyForm";
import { createProperty } from "../../services/propertyService";

const AddProperty = () => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const res = await createProperty(formData);
      toast.success("Property created successfully");
      navigate(`/properties/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create property");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Add a New Property</h1>
      <PropertyForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Publish Property" />
    </div>
  );
};

export default AddProperty;
