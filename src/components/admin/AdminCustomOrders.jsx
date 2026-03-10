import React, { useState } from "react";

const AdminCustomOrders = ({
  customOrders,
  updateCustomStatus,
  CUSTOM_STATUSES,
  badgeClass,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const formatDate = (value) => {
    if (!value) return "—";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
  };

  const filtered = customOrders.filter((order) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return [
      order.reference_id ?? order.id,
      order.org_name ?? order.org,
      order.contact_email ?? order.email,
      order.lanyard_type ?? order.material,
      order.status,
    ].some((val) => String(val ?? "").toLowerCase().includes(q));
  });

  return (
    <>
      <div className="admin__section-header">
        <h2 className="admin__section-title">
          Custom Order Requests ({customOrders.length})
        </h2>
        <input
          className="admin__search"
          type="text"
          placeholder="Search custom orders…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="admin__table-wrap">
        <table className="admin__table">
          <thead>
            <tr>
              <th>Reference ID</th>
              <th>Organization</th>
              <th>Email</th>
              <th>Qty</th>
              <th>Type</th>
              <th>File</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.id ?? order.reference_id}>
                <td style={{ fontWeight: 600 }}>
                  {order.reference_id ?? order.id}
                </td>
                <td>{order.org_name ?? order.org}</td>
                <td style={{ color: "rgba(0,0,0,0.5)" }}>
                  {order.contact_email ?? order.email}
                </td>
                <td>{order.quantity ?? order.qty}</td>
                <td>{order.lanyard_type ?? order.material ?? "—"}</td>
                <td>
                  {order.file_url ? (
                    <a href={order.file_url} target="_blank" rel="noreferrer">
                      View
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  <select
                    className="admin__status-select"
                    value={order.status || "Submitted Order/Custom Request"}
                    onChange={(e) =>
                      updateCustomStatus(order.id, e.target.value)
                    }
                  >
                    {CUSTOM_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ color: "rgba(0,0,0,0.45)" }}>
                  {formatDate(order.created_at ?? order.date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AdminCustomOrders;
