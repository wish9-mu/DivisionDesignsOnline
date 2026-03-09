import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { debugStorage } from "../../utils/storageDebug";
import {
  parseProductImages,
  getProductPrimaryImage,
} from "../../utils/imageUtils";
import { compressImage, getOptimalFormat } from "../../utils/imageCompression";

const emptyProduct = {
  name: "",
  type: "Standard Lanyards",
  price: "",
  tag: "New",
  stock: "",
};

const AdminProducts = ({
  products,
  setProducts,
  isSupabaseConnected,
  badgeClass,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState(emptyProduct);
  const [searchTerm, setSearchTerm] = useState("");
  const [productImages, setProductImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [activeImageMenu, setActiveImageMenu] = useState(null);

  const openAddModal = () => {
    setEditProduct(null);
    setFormData(emptyProduct);
    setProductImages([]);
    setActiveImageMenu(null);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditProduct(product);
    setFormData({
      name: product.name,
      type: product.type,
      price: product.price,
      tag: product.tag,
      stock: product.stock,
    });
    // Parse existing images from image_url (could be single URL or JSON array)
    console.log("Raw image_url from database:", product.image_url);
    const existingImages = parseProductImages(product.image_url);
    console.log("Parsed images:", existingImages);
    setProductImages(existingImages);
    setActiveImageMenu(null);
    setShowModal(true);
  };

  const handleAddImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setUploading(true);
    try {
      console.log("Starting image compression and upload...");
      console.log(
        `Original file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
      );

      // Compress the image before uploading
      const format = await getOptimalFormat();
      const compressedFile = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.85,
        format: format,
      });

      console.log("Uploading compressed image...");
      const imageUrl = await uploadImage(compressedFile);
      console.log("Image uploaded successfully, URL:", imageUrl);
      setProductImages((prev) => [...prev, imageUrl]);
      alert("Image compressed and uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert(
        "Error uploading image: " +
          error.message +
          "\n\nPlease check:\n" +
          "1. Storage bucket 'product-images' exists\n" +
          "2. You are logged in as admin\n" +
          "3. Storage policies are configured correctly",
      );
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    console.log("Uploading file:", fileName);
    console.log("File path:", filePath);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    if (!uploadData) {
      console.error("No upload data returned");
      throw new Error("Upload failed - no data returned");
    }

    console.log("Upload successful:", uploadData);

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(filePath);

    console.log("Public URL:", publicUrl);

    return publicUrl;
  };

  const handleRemoveImage = async (imageUrl, index) => {
    if (!confirm("Are you sure you want to remove this image?")) return;

    setUploading(true);

    try {
      // Extract file path from URL
      const urlParts = imageUrl.split("/product-images/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1];

        // Delete from storage
        const { error: deleteError } = await supabase.storage
          .from("product-images")
          .remove([filePath]);

        if (deleteError) {
          console.error("Storage delete error:", deleteError);
        }
      }

      // Remove from local state
      setProductImages((prev) => prev.filter((_, i) => i !== index));
      setActiveImageMenu(null);
    } catch (error) {
      alert("Error removing image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price) return;

    setUploading(true);

    try {
      // Store images as JSON array (or single URL for backward compatibility)
      const imageUrl =
        productImages.length === 0
          ? null
          : productImages.length === 1
            ? productImages[0]
            : JSON.stringify(productImages);

      const productData = {
        name: formData.name,
        type: formData.type,
        price: Number(formData.price),
        tag: formData.tag,
        stock: Number(formData.stock) || 0,
        image_url: imageUrl,
      };

      if (editProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editProduct.id);

        if (!error) {
          setProducts((prev) =>
            prev.map((p) =>
              p.id === editProduct.id ? { ...p, ...productData } : p,
            ),
          );
        }
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert([productData])
          .select();

        if (!error && data) {
          setProducts((prev) => [...prev, data[0]]);
        }
      }
      setShowModal(false);
    } catch (error) {
      alert("Error saving product: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    await supabase.from("products").delete().eq("id", id);

    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <>
      <div className="admin__section-header">
        <h2 className="admin__section-title">
          All Products ({products.length})
        </h2>
        <input
          className="admin__search"
          type="text"
          placeholder="Search products…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          className="admin__add-btn"
          onClick={() => {
            console.log("🔍 Running storage debug...");
            debugStorage();
          }}
          style={{ marginRight: "8px", backgroundColor: "#6c757d" }}
        >
          🔍 Debug Storage
        </button>
        <button className="admin__add-btn" onClick={openAddModal}>
          + Add Product
        </button>
      </div>
      <div
        style={{
          marginBottom: "1rem",
          padding: "0.75rem",
          background: isSupabaseConnected ? "#d4edda" : "#fff3cd",
          borderRadius: "4px",
          fontSize: "0.875rem",
          border: "1px solid" + (isSupabaseConnected ? "#c3e6cb" : "#ffeeba"),
        }}
      >
        {isSupabaseConnected
          ? "✅ Connected to Supabase - Products are loaded from database"
          : "⚠️ Using local data - Supabase not connected or table not set up"}
      </div>
      <div className="admin__table-wrap">
        <table className="admin__table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Type</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Tag</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products
              .filter((product) => {
                if (!searchTerm) return true;
                const q = searchTerm.toLowerCase();
                return [product.name, product.type, product.tag].some((val) =>
                  String(val ?? "")
                    .toLowerCase()
                    .includes(q),
                );
              })
              .map((product) => {
                // Get the first/primary image using utility function
                const firstImageUrl = getProductPrimaryImage(product);
                if (!firstImageUrl) {
                  console.warn(`Product "${product.name}" has no image_url`);
                }

                return (
                  <tr key={product.id}>
                    <td>
                      <div className="admin__table-product">
                        <div
                          className="admin__table-thumb"
                          style={{
                            backgroundImage: firstImageUrl
                              ? `url(${firstImageUrl})`
                              : "none",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundColor: firstImageUrl
                              ? "transparent"
                              : "#f5f5f5",
                          }}
                        />
                        <span className="admin__table-name">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td>{product.type}</td>
                    <td style={{ fontWeight: 700 }}>
                      ₱{product.price.toFixed(2)}
                    </td>
                    <td>
                      {product.stock > 0 ? (
                        product.stock
                      ) : (
                        <span style={{ color: "rgba(0,0,0,0.3)" }}>
                          Made to order
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={badgeClass(product.tag)}>
                        {product.tag}
                      </span>
                    </td>
                    <td>
                      <div className="admin__actions">
                        <button
                          className="admin__action-btn"
                          onClick={() => openEditModal(product)}
                        >
                          Edit
                        </button>
                        <button
                          className="admin__action-btn admin__action-btn--danger"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div
          className="admin__modal-overlay"
          onClick={() => {
            setShowModal(false);
            setActiveImageMenu(null);
          }}
        >
          <div
            className="admin__modal"
            onClick={(e) => {
              e.stopPropagation();
              setActiveImageMenu(null);
            }}
          >
            <div className="admin__modal-header">
              <h2>{editProduct ? "Edit Product" : "Add Product"}</h2>
              <button
                className="admin__modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <div className="admin__modal-body">
              <div className="admin__form-group">
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <span style={{ color: "#d32f2f" }}>*</span> Product Images
                  <span
                    style={{
                      fontSize: "0.875rem",
                      color: "#666",
                      backgroundColor: "#f5f5f5",
                      padding: "2px 8px",
                      borderRadius: "12px",
                    }}
                  >
                    ℹ
                  </span>
                </label>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginBottom: "1rem",
                  }}
                >
                  {productImages.map((imageUrl, index) => (
                    <div
                      key={index}
                      style={{
                        position: "relative",
                        width: "80px",
                        height: "80px",
                        borderRadius: "4px",
                        overflow: "hidden",
                        border: "2px solid #e0e0e0",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setActiveImageMenu(
                          activeImageMenu === index ? null : index,
                        )
                      }
                    >
                      <img
                        src={imageUrl}
                        alt={`Product ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          console.error("Failed to load image:", imageUrl);
                          e.target.style.backgroundColor = "#f5f5f5";
                          e.target.style.display = "flex";
                          e.target.style.alignItems = "center";
                          e.target.style.justifyContent = "center";
                          e.target.alt = "❌ Failed to load";
                        }}
                        onLoad={() => {
                          console.log("Image loaded successfully:", imageUrl);
                        }}
                      />
                      {activeImageMenu === index && (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: "0",
                            backgroundColor: "white",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                            zIndex: 1000,
                            minWidth: "140px",
                            marginTop: "4px",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(imageUrl, index)}
                            disabled={uploading}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              width: "100%",
                              padding: "8px 12px",
                              border: "none",
                              background: "transparent",
                              cursor: uploading ? "not-allowed" : "pointer",
                              fontSize: "0.875rem",
                              color: "#d32f2f",
                              textAlign: "left",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#f5f5f5")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            <span style={{ fontSize: "1rem" }}>🗑️</span> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add Image Button */}
                  <label
                    style={{
                      width: "80px",
                      height: "80px",
                      border: "2px dashed #ccc",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: uploading ? "not-allowed" : "pointer",
                      backgroundColor: "#fafafa",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (!uploading) {
                        e.currentTarget.style.borderColor = "#999";
                        e.currentTarget.style.backgroundColor = "#f5f5f5";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#ccc";
                      e.currentTarget.style.backgroundColor = "#fafafa";
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAddImage}
                      disabled={uploading}
                      style={{ display: "none" }}
                    />
                    <span style={{ fontSize: "2rem", color: "#999" }}>
                      {uploading ? "..." : "+"}
                    </span>
                  </label>
                </div>
              </div>
              <div className="admin__form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Classic Black Lanyard"
                />
              </div>
              <div className="admin__form-row">
                <div className="admin__form-group">
                  <label>Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    <option>Standard Lanyards</option>
                    <option>Custom Lanyards</option>
                  </select>
                </div>
                <div className="admin__form-group">
                  <label>Tag</label>
                  <select
                    value={formData.tag}
                    onChange={(e) =>
                      setFormData({ ...formData, tag: e.target.value })
                    }
                  >
                    <option>Bestseller</option>
                    <option>New</option>
                    <option>Featured</option>
                    <option>Custom</option>
                    <option>Premium</option>
                  </select>
                </div>
              </div>
              <div className="admin__form-row">
                <div className="admin__form-group">
                  <label>Price (₱)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="e.g. 120"
                  />
                </div>
                <div className="admin__form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    placeholder="0 = made to order"
                  />
                </div>
              </div>
            </div>
            <div className="admin__modal-footer">
              <button
                className="admin__modal-cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="admin__modal-save"
                onClick={handleSaveProduct}
                disabled={uploading}
              >
                {uploading
                  ? "Uploading..."
                  : editProduct
                    ? "Save Changes"
                    : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminProducts;
