import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import "./PageStyles.css";
import { supabase } from "../supabaseClient";
import "react-calendar/dist/Calendar.css";
import Calendar from "react-calendar";
import { useAuth } from "../context/AuthContext";

const CustomOrdersPage = () => {
  const [activeTab, setActiveTab] = useState("Submit Request");
  const [trackId, setTrackId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [form, setForm] = useState({
    org_name: "",
    contact_email: "",
    quantity: 1,
    lanyard_type: "Full-Color Print",
    design_description: "",
    appointment_date: null,
    appointment_time: "",
  });


  const [file, setFile] = useState(null);
  const [generatedRef, setGeneratedRef] = useState("");
  const [trackResult, setTrackResult] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAppointments = async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("appointment_date,appointment_time");

      if (error) {
        console.error("Error fetching appointments:", error.message);
      } else {
        // Normalize rows to a consistent shape
        const normalized = (data || []).map((r) => ({
          appointment_date: r.appointment_date,
          appointment_time: r.appointment_time,
        }));
        setAppointments(normalized);
      }
    };

    fetchAppointments();
  }, []);

  const formatDate = (d) => {
    if (!d) return "";
    const dateObj = typeof d === "string" ? new Date(d) : d;
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const isTimeSlotAvailable = (date, time) => {
    // date expected as YYYY-MM-DD string
    return !appointments.some(
      (appointment) =>
        appointment.appointment_date === date && appointment.appointment_time === time
    );
  };

  const handleDateChange = (date) => {
    // Calendar returns a Date object in local timezone. Keep the Date object
    // but use a local YYYY-MM-DD formatter when comparing / saving to DB.
    setForm((f) => ({ ...f, appointment_date: date }));
    setShowDatePicker(false);
  };

  const handleTimeSelect = (time) => {
    const dateStr = formatDate(form.appointment_date);
    if (!dateStr) return alert("Please select a date first.");
    if (isTimeSlotAvailable(dateStr, time)) {
      setForm((f) => ({ ...f, appointment_time: time }));
    } else {
      alert("The selected time slot is already booked. Please choose another time.");
    }
  };

  const generateTimeSlots = () => {
    const startHour = 10;
    const endHour = 19;
    const interval = 30; // 30 minutes
    const slots = [];

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minutes = 0; minutes < 60; minutes += interval) {
        const time = new Date();
        time.setHours(hour, minutes, 0, 0);
        slots.push(time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      }
    }

    return slots;
  };

  const isSlotTaken = (time) => {
    const dateStr = formatDate(form.appointment_date);
    if (!dateStr) return false;
    return appointments.some(
      (appointment) =>
        appointment.appointment_date === dateStr && appointment.appointment_time === time
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const reference_id = `DD-${new Date().getFullYear()}-${String(
      Math.floor(Math.random() * 1e6)
    ).padStart(6, "0")}`;

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

    try {
      // Insert into custom_orders table
      const { error: insertError } = await supabase.from("custom_orders").insert([
        {
          reference_id,
          org_name: form.org_name,
          contact_email: form.contact_email,
          quantity: Number(form.quantity),
          lanyard_type: form.lanyard_type,
          design_description: form.design_description,
          status: "Pending Review",
          file_url,
          appointment_date: formatDate(form.appointment_date),
          appointment_time: form.appointment_time,
          ...(user?.id ? { user_id: user.id } : {}),
        },
      ]);

      if (insertError) throw insertError;

      // Insert into appointments table
      const { error: appointmentError } = await supabase.from("appointments").insert([
        {
          ...(user?.id ? { user_id: user.id } : {}),
          full_name: form.org_name,
          email: form.contact_email,
          phone: form.phone || null,
          appointment_type: "Custom Order Appointment",
          appointment_date: formatDate(form.appointment_date),
          appointment_time: form.appointment_time,
          notes: `Custom order for ${form.quantity} ${form.lanyard_type}`,
          status: "Scheduled",
          appointment_code: reference_id,
        },
      ]);

      if (appointmentError) throw appointmentError;

      setGeneratedRef(reference_id);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      if (error.code === "23505") {
        alert("The selected date and time are already booked. Please choose another slot.");
      } else {
        console.error("Error submitting appointment:", error.message);
        alert("An error occurred. Please try again.");
      }
    }
  };

  const handleTrack = async () => {
    if (!trackId.trim()) {
      alert("Please enter a Reference ID.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("custom_orders")
        .select("*")
        .eq("reference_id", trackId.trim());

      if (error) throw error;

      if (data && data.length > 0) {
        setTrackResult(data[0]);
      } else {
        alert("Order not found with the provided Reference ID.");
        setTrackResult(null);
      }
    } catch (err) {
      console.error("Error fetching order status:", err.message);
      alert("An error occurred while tracking the order.");
    }
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
              className={`page__tab${activeTab === tab ? " page__tab--active" : ""
                }`}
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

            <div className="form-row">
              <div className="form-group">
                <label>Appointment Date</label>
                <button
                  type="button"
                  className="date-picker-btn"
                  onClick={() => setShowDatePicker(true)}
                >
                  {form.appointment_date ? formatDate(form.appointment_date) : "Select Date"}
                </button>
                {showDatePicker && (
                  <div className="date-picker-popup">
                    <Calendar
                      onChange={handleDateChange}
                      value={form.appointment_date || new Date()}
                    />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Appointment Time</label>
                <div className="time-picker">
                  {!form.appointment_date ? (
                    <p className="muted">Please select a date first</p>
                  ) : (
                    generateTimeSlots()
                      .filter((time) => !isSlotTaken(time))
                      .map((time) => (
                        <button
                          key={time}
                          type="button"
                          className={`time-slot-btn${form.appointment_time === time ? " time-slot-btn--selected" : ""
                            }`}
                          onClick={() => handleTimeSelect(time)}
                        >
                          {time}
                        </button>
                      ))
                  )}
                </div>
              </div>
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
