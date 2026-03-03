import React, { useState } from "react";
import Layout from "../components/Layout";
import "./PageStyles.css";
import { supabase } from "../supabaseClient";

const CustomOrdersPage = () => {
  const [activeTab, setActiveTab] = useState("Submit Request");
  const [trackId, setTrackId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    org_name: "",
    contact_email: "",
    quantity: 1,
    lanyard_type: "Full-Color Print",
    design_description: "",
  });
  const [file, setFile] = useState(null);
  const [generatedRef, setGeneratedRef] = useState("");

  const [trackResult, setTrackResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const reference_id = `DD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1e6)).padStart(6, "0")}`;

    let file_url = null;

    if (file) {
      const fileExt = file.name.split(".").pop();
      const filePath = `${reference_id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("custom-order-files")
        .upload(filePath, file);

      if (uploadError) return alert(uploadError.message);

      const { data } = supabase.storage
        .from("custom-order-files")
        .getPublicUrl(filePath);

      file_url = data.publicUrl;
    }

    const { error: insertError } = await supabase.from("custom_orders").insert([
      {
        reference_id,
        org_name: form.org_name,
        contact_email: form.contact_email,
        quantity: Number(form.quantity),
        lanyard_type: form.lanyard_type,
        design_description: form.design_description,
        file_url,
      },
    ]);

    if (insertError) return alert(insertError.message);

    setGeneratedRef(reference_id);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleTrack = async () => {
    setTrackResult(null);

    const { data, error } = await supabase
      .from("custom_orders")
      .select("reference_id,status,created_at,org_name,quantity,lanyard_type")
      .eq("reference_id", trackId)
      .maybeSingle();

    if (error) return alert(error.message);
    if (!data) return alert("Reference ID not found.");

    setTrackResult(data);
  };

  return (
    <Layout>
      <div className="page">
        <div className="page__header">
          <p className="page__eyebrow">Custom</p>
          <h1 className="page__title">Custom Orders</h1>
          <p className="page__subtitle">
            Design your own lanyard — we'll bring it to life.
          </p>
        </div>

        <div className="page__tabs">
          {["Submit Request", "Track Status"].map((tab) => (
            <button
              key={tab}
              className={`page__tab${activeTab === tab ? " page__tab--active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Submit Request" && (
          <form className="custom-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Organization / Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mapua University"
                  required
                  value={form.org_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, org_name: e.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  placeholder="you@email.com"
                  required
                  value={form.contact_email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, contact_email: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 50"
                  required
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, quantity: e.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label>Material Type</label>
                <select>
                  <option>Polyester</option>
                  <option>Polycotton</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Lanyard Size</label>
                <select>
                  <option>1/2 inch</option>
                  <option>3/4 inch</option>
                  <option>1 inch</option>
                </select>
              </div>
              <div className="form-group">
                <label>Print Type</label>
                <select>
                  <option>Back to Back</option>
                  <option>One Side</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Design Description</label>
              <textarea
                rows="4"
                placeholder="Describe your design, colors, logo placement, text..."
                required
                value={form.design_description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, design_description: e.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label>Reference Files (optional)</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {generatedRef && (
              <p style={{ textAlign: "center" }}>
                Your Reference ID: <b>{generatedRef}</b>
              </p>
            )}

            <button
              type="submit"
              className={`page__cta-btn${submitted ? " page__cta-btn--success" : ""}`}
            >
              {submitted ? "✓ Request Sent!" : "Submit Request"}
            </button>
          </form>
        )}

        {activeTab === "Track Status" && (
          <div className="track-status">
            <div
              className="form-group"
              style={{ maxWidth: 480, margin: "0 auto" }}
            >
              <label>Order / Reference ID</label>
              <div className="track-row">
                <input
                  type="text"
                  placeholder="e.g. DD-2024-0012"
                  value={trackId}
                  onChange={(e) => setTrackId(e.target.value)}
                />
                <button className="page__cta-btn" onClick={handleTrack}>
                  Track
                </button>
              </div>
            </div>

            {!trackResult && (
              <div className="track-empty">
                <p>
                  Enter your reference ID to check the status of your custom
                  order.
                </p>
              </div>
            )}

            {trackResult && (
              <div className="track-empty">
                <p>
                  <b>Status:</b> {trackResult.status}
                </p>
                <p>
                  <b>Reference ID:</b> {trackResult.reference_id}
                </p>
                <p>
                  <b>Organization:</b> {trackResult.org_name}
                </p>
                <p>
                  <b>Quantity:</b> {trackResult.quantity}
                </p>
                <p>
                  <b>Lanyard Type:</b> {trackResult.lanyard_type}
                </p>
                <p>
                  <b>Submitted:</b>{" "}
                  {new Date(trackResult.created_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CustomOrdersPage;
