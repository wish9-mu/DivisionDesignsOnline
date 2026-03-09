import React, { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import "./PageStyles.css";
import { supabase } from "../supabaseClient";
import "react-calendar/dist/Calendar.css";
import Calendar from "react-calendar";
import { useAuth } from "../context/AuthContext";
import gsap from "gsap";
import { Loader2, CalendarDays, SearchX } from "lucide-react";

const CustomOrdersPage = () => {
  const [activeTab, setActiveTab] = useState("Submit Request");
  const [trackId, setTrackId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);

  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const errorPopupRef = useRef(null);

  const triggerErrorPopup = (msg) => {
    setErrorMessage(msg);
    setShowErrorPopup(true);
    setTimeout(() => {
      if (errorPopupRef.current) {
        // Reset transition in case it was applied previously
        errorPopupRef.current.style.transition = 'none';
        gsap.fromTo(
          errorPopupRef.current,
          { y: 50, opacity: 0, scale: 0.9 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.5)" }
        );
      }
    }, 50);

    setTimeout(() => {
      if (errorPopupRef.current) {
        errorPopupRef.current.style.transition = "opacity 0.6s ease-in-out";
        errorPopupRef.current.style.opacity = "0";
      }
    }, 6400);

    setTimeout(() => {
      setShowErrorPopup(false);
      setErrorMessage("");
    }, 7000);
  };

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
  const [isTrackLoading, setIsTrackLoading] = useState(false);
  const [trackInputError, setTrackInputError] = useState("");
  const [trackError, setTrackError] = useState(false);
  const [recentLookups, setRecentLookups] = useState([]);
  const resultCardRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem("recentLookups");
    if (saved) {
      try { setRecentLookups(JSON.parse(saved)); } catch { /* ignore syntax error */ }
    }
  }, []);

  const saveLookup = (order) => {
    setRecentLookups(prev => {
      const filtered = prev.filter(p => p.reference_id !== order.reference_id);
      const updated = [order, ...filtered].slice(0, 5);
      localStorage.setItem("recentLookups", JSON.stringify(updated));
      return updated;
    });
  };
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

  useEffect(() => {
    if (trackResult && resultCardRef.current && activeTab === "Track Status") {
      const ctx = gsap.context(() => {
        gsap.fromTo([".track-panel-header", ".track-panel-body", ".track-panel-bottom"],
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power3.out" }
        );

        gsap.fromTo(".v-step-circle",
          { scale: 0 },
          {
            scale: 1,
            duration: 0.6,
            stagger: 0.15,
            ease: "back.out(1.5)",
            delay: 0.2
          }
        );

        gsap.fromTo(".meta-row",
          { opacity: 0, x: 10 },
          {
            opacity: 1,
            x: 0,
            duration: 0.4,
            stagger: 0.07,
            delay: 0.15,
            ease: "power2.out",
          }
        );

        if (trackResult.appointment_date) {
          gsap.fromTo(".appointment-block",
            { opacity: 0, y: 10 },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              delay: 0.8,
            }
          );
        }
      }, resultCardRef);

      return () => ctx.revert();
    }
  }, [trackResult, activeTab]);

  const getStatusInfo = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("pending")) return { label: "Pending Review", className: "status-pending", stepIdx: 1 };
    if (s.includes("production")) return { label: "In Production", className: "status-production", stepIdx: 2 };
    if (s.includes("ready") || s.includes("shipped") || s.includes("complete")) return { label: "Completed", className: "status-ready", stepIdx: 3 };
    return { label: "Submitted Request", className: "status-default", stepIdx: 0 };
  };



  const formatAppointmentDate = (dateStr) => {
    if (!dateStr) return "";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

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
    if (!dateStr) {
      triggerErrorPopup("Please select a date first.");
      return;
    }
    if (isTimeSlotAvailable(dateStr, time)) {
      setForm((f) => ({ ...f, appointment_time: time }));
    } else {
      triggerErrorPopup("The selected date and time are already booked. Please choose another slot.");
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

  const categorizeTime = (timeStr) => {
    const isPM = timeStr.includes("PM");
    const [hourStr] = timeStr.split(":");
    let hour = parseInt(hourStr, 10);
    if (isPM && hour !== 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;

    if (hour < 12) return "Morning";
    if (hour < 17) return "Afternoon";
    return "Evening";
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

      if (uploadError) {
        triggerErrorPopup(uploadError.message);
        return;
      }

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
      setShowPopup(true);

      setTimeout(() => {
        if (popupRef.current) {
          gsap.fromTo(
            popupRef.current,
            { y: 50, opacity: 0, scale: 0.9 },
            { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.5)" }
          );
        }
      }, 50);

      setTimeout(() => {
        if (popupRef.current) {
          popupRef.current.style.transition = "opacity 0.6s ease-in-out";
          popupRef.current.style.opacity = "0";
        }
      }, 6400);

      setTimeout(() => {
        setShowPopup(false);
        setSubmitted(false);
      }, 7000);
    } catch (error) {
      if (error.code === "23505") {
        triggerErrorPopup("The selected date and time are already booked. Please choose another slot.");
      } else {
        console.error("Error submitting appointment:", error.message);
        triggerErrorPopup("An error occurred. Please try again.");
      }
    }
  };

  const handleTrack = async () => {
    if (!trackId.trim()) {
      setTrackInputError("Please enter a Reference ID.");
      return;
    }
    setTrackInputError("");

    setIsTrackLoading(true);
    setTrackError(false);
    setTrackResult(null);

    try {
      const { data, error } = await supabase
        .from("custom_orders")
        .select("*")
        .ilike("reference_id", trackId.trim());

      if (error) throw error;

      if (data && data.length > 0) {
        setTrackResult(data[0]);
        saveLookup(data[0]);
      } else {
        setTrackError(true);
      }
    } catch (err) {
      console.error("Error fetching order status:", err.message);
      triggerErrorPopup("An error occurred while tracking the order.");
    } finally {
      setIsTrackLoading(false);
    }
  };

  const handleTrackSpecific = async (id) => {
    if (!id) return;
    setIsTrackLoading(true);
    setTrackError(false);
    setTrackResult(null);
    setTrackId(id);
    try {
      const { data, error } = await supabase.from("custom_orders").select("*").ilike("reference_id", id);
      if (error) throw error;
      if (data && data.length > 0) {
        setTrackResult(data[0]);
        saveLookup(data[0]);
      } else {
        setTrackError(true);
      }
    } catch (err) {
      console.error("Error fetching order status:", err.message);
      triggerErrorPopup("An error occurred while tracking the order.");
    } finally {
      setIsTrackLoading(false);
    }
  };

  const handleTrackKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTrack();
    }
  };

  return (
    <Layout isFullWidth={activeTab === "Track Status"}>
      {showErrorPopup && (
        <div
          ref={errorPopupRef}
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            background: "#7f1d1d",
            color: "#F8EEDF",
            padding: "1.5rem 2rem",
            borderRadius: "12px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
            zIndex: 9999,
            maxWidth: "400px",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>Error</h4>
          <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.5 }}>
            {errorMessage}
          </p>
        </div>
      )}
      {showPopup && (
        <div
          ref={popupRef}
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            background: "#8E1616",
            color: "#F8EEDF",
            padding: "1.5rem 2rem",
            borderRadius: "12px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
            zIndex: 9999,
            maxWidth: "400px",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>Success</h4>
          <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.5 }}>
            Thank you for submitting your custom lanyard request! We'll get back to you with your email ({form.contact_email}).
          </p>
        </div>
      )}
      <div className={`page ${activeTab === "Track Status" ? "page--tracking" : ""}`}>
        {activeTab !== "Track Status" && (
          <div className="page__header">
            <p className="page__eyebrow">Custom</p>
            <h1 className="page__title">Custom Orders</h1>
            <p className="page__subtitle">
              Design your own lanyard — we'll bring it to life.
            </p>
          </div>
        )}

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
                      minDate={new Date()}
                    />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Appointment Time</label>
                {!form.appointment_date ? (
                  <div className="time-picker-container">
                    <p className="muted" style={{ margin: "0.5rem 0" }}>Please select a date first</p>
                  </div>
                ) : (
                  <div className="time-picker-container">
                    {["Morning", "Afternoon", "Evening"].map((category) => {
                      const slots = generateTimeSlots()
                        .filter((time) => !isSlotTaken(time))
                        .filter((time) => categorizeTime(time) === category);

                      if (slots.length === 0) return null;

                      return (
                        <div key={category} className="time-category">
                          <h5 className="time-category-title">{category}</h5>
                          <div className="time-picker">
                            {slots.map((time) => (
                              <button
                                key={time}
                                type="button"
                                className={`time-slot-btn${form.appointment_time === time ? " time-slot-btn--selected" : ""
                                  }`}
                                onClick={() => handleTimeSelect(time)}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {generatedRef && (
              <p style={{ textAlign: "center", color: "#000" }}>
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
          <div className="track-app-shell">
            <style>{`
              @keyframes spin-icon {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>

            {/* Left Sidebar */}
            <div className="track-sidebar">
              <div className="track-sidebar-header">
                <span className="sidebar-eyebrow">Custom Orders</span>
                <h2 className="sidebar-title">Track<br />Your Order</h2>
                <p className="sidebar-desc">Enter your reference ID below to see the latest updates on your items.</p>
              </div>

              <div className="sidebar-search">
                <input
                  type="text"
                  placeholder="Reference ID"
                  value={trackId}
                  onChange={(e) => {
                    setTrackId(e.target.value);
                    if (trackInputError) setTrackInputError("");
                  }}
                  onKeyDown={handleTrackKeyDown}
                  disabled={isTrackLoading}
                />
                <button
                  className="sidebar-search-btn"
                  onClick={handleTrack}
                  disabled={isTrackLoading}
                >
                  {isTrackLoading ? <Loader2 style={{ animation: "spin-icon 1s linear infinite" }} size={18} /> : "Track"}
                </button>
              </div>
              {trackInputError && (
                <p className="sidebar-error">{trackInputError}</p>
              )}

              <div className="sidebar-recent">
                <h3 className="recent-heading">Recent Lookups</h3>
                {recentLookups.length > 0 ? (
                  <div className="recent-list">
                    {recentLookups.map((lookup) => (
                      <div key={lookup.reference_id} className="recent-card" onClick={() => handleTrackSpecific(lookup.reference_id)}>
                        <div className="recent-card-left">
                          <span className="recent-id">{lookup.reference_id}</span>
                          <span className="recent-org">{lookup.org_name}</span>
                        </div>
                        <div className={`status-dot-indicator ${lookup.status.toLowerCase().includes('ready') || lookup.status.toLowerCase().includes('shipped') ? 'inactive' : 'active'}`}></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="recent-empty">No locally saved orders yet.</p>
                )}
              </div>
            </div>

            {/* Right Content */}
            <div className="track-content">
              {!trackResult && !trackError && !isTrackLoading && (
                <div className="track-content-empty">
                  <SearchX size={48} className="empty-icon-muted" style={{ margin: '0 auto 1.5rem', opacity: 0.15 }} />
                  <p>Enter your reference ID to check the status of your custom order.</p>
                </div>
              )}

              {trackError && !isTrackLoading && (
                <div className="track-content-empty error">
                  <SearchX size={48} color="#8E1616" style={{ margin: '0 auto 1rem' }} />
                  <h3>Order Not Found</h3>
                  <p>We couldn't find an order with that Reference ID.<br />Please ensure it follows the format <b>DD-YYYY-XXXXXX</b>.</p>
                </div>
              )}

              {trackResult && (
                <div className="track-result-wrapper" ref={resultCardRef}>
                  {(() => {
                    const statusInfo = getStatusInfo(trackResult.status);
                    const stages = [
                      { key: "submitted", label: "Submitted Request", desc: "Order received and logged into the system." },
                      { key: "pending_review", label: "Pending Review", desc: "Design specs reviewed and approved." },
                      { key: "in_production", label: "In Production", desc: "Printing underway at production facility." },
                      { key: "completed", label: "Completed", desc: "Order dispatched and on its way." }
                    ];

                    return (
                      <>
                        <div className="track-panel-header">
                          <div className="panel-col">
                            <span className="panel-label">Reference ID</span>
                            <span className="panel-value-id">{trackResult.reference_id}</span>
                          </div>
                          <div className="panel-col">
                            <span className="panel-label">Organization</span>
                            <span className="panel-value">{trackResult.org_name}</span>
                          </div>
                          <div className="panel-col">
                            <span className="panel-label">Current Status</span>
                            <div className={`status-badge ${statusInfo.className}`}>
                              <div className="status-dot"></div>
                              {statusInfo.label}
                            </div>
                          </div>
                          <div className="panel-col">
                            <span className="panel-label">Submitted</span>
                            <span className="panel-value-date">
                              {trackResult.created_at ? new Date(trackResult.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "Recently"}<br />
                              <span className="muted-time">{trackResult.created_at ? new Date(trackResult.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ""}</span>
                            </span>
                          </div>
                        </div>

                        <div className="track-panel-body">
                          <div className="progress-section">
                            <h4 className="section-title">Order Progress</h4>
                            <div className="vertical-tracker">
                              {stages.map((stage, idx) => {
                                let stepClass = "inactive";
                                if (idx < statusInfo.stepIdx) stepClass = "completed";
                                else if (idx === statusInfo.stepIdx) stepClass = "active";

                                return (
                                  <div key={stage.key} className={`v-step ${stepClass}`}>
                                    <div className="v-step-spine">
                                      <div className="v-step-circle">
                                        {idx < statusInfo.stepIdx ? "✓" : (idx === statusInfo.stepIdx ? (idx === stages.length - 1 ? "✓" : "•") : "")}
                                      </div>
                                      {idx < stages.length - 1 && (
                                        <div className={`v-step-line ${idx < statusInfo.stepIdx ? 'filled' : ''}`}></div>
                                      )}
                                    </div>
                                    <div className="v-step-content">
                                      <div className="v-step-name">{stage.label}</div>
                                      <div className="v-step-desc">{stage.desc}</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {trackResult.appointment_date && (
                              <div className="appointment-block">
                                <div className="appointment-icon">
                                  <CalendarDays size={20} />
                                </div>
                                <div className="appointment-details">
                                  <span className="appointment-label">Appointment Scheduled</span>
                                  <span className="appointment-time">
                                    {formatAppointmentDate(trackResult.appointment_date)} · {trackResult.appointment_time}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="meta-rail">
                            <div className="meta-row">
                              <span className="meta-label">Reference ID</span>
                              <span className="meta-value-id">{trackResult.reference_id}</span>
                            </div>
                            <div className="meta-row">
                              <span className="meta-label">Organization</span>
                              <span className="meta-value">{trackResult.org_name}</span>
                            </div>
                            <div className="meta-row">
                              <span className="meta-label">Quantity</span>
                              <span className="meta-value">{trackResult.quantity} units</span>
                            </div>
                            <div className="meta-row">
                              <span className="meta-label">Lanyard Type</span>
                              <span className="meta-value">{trackResult.lanyard_type}</span>
                            </div>
                            {trackResult.design_description && (
                              <div className="meta-row meta-row-notes">
                                <span className="meta-label">Notes</span>
                                <span className="meta-value-notes">{trackResult.design_description}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="track-panel-bottom">
                          <div className="bottom-left">
                            <span className="last-updated">Last updated &middot; {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} &middot; {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="bottom-right">
                            <button className="btn-outline">Download PDF</button>
                            <button className="btn-solid" onClick={() => window.location.href = '/contact'}>Contact Support</button>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CustomOrdersPage;
