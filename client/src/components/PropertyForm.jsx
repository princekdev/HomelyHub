import { useState } from "react";
import { PROPERTY_TYPES, AMENITIES } from "../utils/constants";
import { X, ImagePlus } from "lucide-react";

const PropertyForm = ({ initialValues, existingImages = [], onSubmit, submitting, submitLabel = "Save" }) => {
  const [form, setForm] = useState({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    propertyType: initialValues?.propertyType || PROPERTY_TYPES[0],
    address: initialValues?.location?.address || "",
    city: initialValues?.location?.city || "",
    state: initialValues?.location?.state || "",
    country: initialValues?.location?.country || "India",
    postalCode: initialValues?.location?.postalCode || "",
    pricePerNight: initialValues?.pricePerNight || "",
    cleaningFee: initialValues?.cleaningFee || "",
    guests: initialValues?.guests || 1,
    bedrooms: initialValues?.bedrooms || 1,
    beds: initialValues?.beds || 1,
    bathrooms: initialValues?.bathrooms || 1,
    amenities: initialValues?.amenities || [],
  });
  const [newImages, setNewImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState({});

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const toggleAmenity = (a) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (!form.address.trim() || !form.city.trim() || !form.state.trim()) {
      errs.location = "Address, city and state are required";
    }
    if (!form.pricePerNight || Number(form.pricePerNight) <= 0) {
      errs.pricePerNight = "Enter a valid price greater than 0";
    }
    if (!existingImages.length && newImages.length === 0) {
      errs.images = "Please upload at least one image";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "amenities") {
        formData.append("amenities", value.join(","));
      } else {
        formData.append(key, value);
      }
    });
    newImages.forEach((file) => formData.append("images", file));

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="card-surface p-6 space-y-4">
        <h2 className="font-semibold text-lg">Basic Information</h2>
        <div>
          <label className="text-sm font-medium mb-1 block">Title</label>
          <input value={form.title} onChange={(e) => update("title", e.target.value)} className="input-field" placeholder="Cozy apartment near city center" />
          {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Description</label>
          <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} className="input-field" placeholder="Describe your property..." />
          {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Property type</label>
          <select value={form.propertyType} onChange={(e) => update("propertyType", e.target.value)} className="input-field">
            {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </section>

      <section className="card-surface p-6 space-y-4">
        <h2 className="font-semibold text-lg">Location</h2>
        <div>
          <label className="text-sm font-medium mb-1 block">Address</label>
          <input value={form.address} onChange={(e) => update("address", e.target.value)} className="input-field" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">City</label>
            <input value={form.city} onChange={(e) => update("city", e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">State</label>
            <input value={form.state} onChange={(e) => update("state", e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Country</label>
            <input value={form.country} onChange={(e) => update("country", e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Postal code</label>
            <input value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} className="input-field" />
          </div>
        </div>
        {errors.location && <p className="text-xs text-red-600">{errors.location}</p>}
      </section>

      <section className="card-surface p-6 space-y-4">
        <h2 className="font-semibold text-lg">Pricing</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Price per night (₹)</label>
            <input type="number" min="0" value={form.pricePerNight} onChange={(e) => update("pricePerNight", e.target.value)} className="input-field" />
            {errors.pricePerNight && <p className="text-xs text-red-600 mt-1">{errors.pricePerNight}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Cleaning fee (₹)</label>
            <input type="number" min="0" value={form.cleaningFee} onChange={(e) => update("cleaningFee", e.target.value)} className="input-field" />
          </div>
        </div>
      </section>

      <section className="card-surface p-6 space-y-4">
        <h2 className="font-semibold text-lg">Capacity</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {["guests", "bedrooms", "beds", "bathrooms"].map((field) => (
            <div key={field}>
              <label className="text-sm font-medium mb-1 block capitalize">{field}</label>
              <input type="number" min="0" value={form[field]} onChange={(e) => update(field, e.target.value)} className="input-field" />
            </div>
          ))}
        </div>
      </section>

      <section className="card-surface p-6 space-y-4">
        <h2 className="font-semibold text-lg">Amenities</h2>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => toggleAmenity(a)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                form.amenities.includes(a) ? "bg-brand-500 border-brand-500 text-white" : "border-ink-200 text-ink-600"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </section>

      <section className="card-surface p-6 space-y-4">
        <h2 className="font-semibold text-lg">Images</h2>
        {existingImages.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
            {existingImages.map((img, i) => (
              <img key={i} src={img.url} alt="" className="w-full h-24 object-cover rounded-lg" />
            ))}
          </div>
        )}
        {previews.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
            {previews.map((src, i) => (
              <div key={i} className="relative">
                <img src={src} alt="" className="w-full h-24 object-cover rounded-lg" />
                <button type="button" onClick={() => removeNewImage(i)} className="absolute top-1 right-1 bg-white/90 rounded-full p-1">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        <label className="btn-outline inline-flex cursor-pointer">
          <ImagePlus size={16} /> Upload images
          <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
        </label>
        {errors.images && <p className="text-xs text-red-600 mt-1">{errors.images}</p>}
      </section>

      <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3">
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
};

export default PropertyForm;
