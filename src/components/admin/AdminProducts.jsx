import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

const emptyProduct = { name: '', type: 'Standard Lanyards', price: '', tag: 'New', stock: '' };

const AdminProducts = ({ products, setProducts, isSupabaseConnected, badgeClass }) => {
    const [showModal, setShowModal] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [formData, setFormData] = useState(emptyProduct);
    const [searchTerm, setSearchTerm] = useState('');

    const openAddModal = () => {
        setEditProduct(null);
        setFormData(emptyProduct);
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setEditProduct(product);
        setFormData({ name: product.name, type: product.type, price: product.price, tag: product.tag, stock: product.stock });
        setShowModal(true);
    };

    const handleSaveProduct = async () => {
        if (!formData.name || !formData.price) return;

        const productData = {
            name: formData.name,
            type: formData.type,
            price: Number(formData.price),
            tag: formData.tag,
            stock: Number(formData.stock) || 0
        };

        if (editProduct) {
            const { error } = await supabase
                .from('products')
                .update(productData)
                .eq('id', editProduct.id);

            if (!error) {
                setProducts(prev => prev.map(p => p.id === editProduct.id ? { ...p, ...productData } : p));
            }
        } else {
            const { data, error } = await supabase
                .from('products')
                .insert([productData])
                .select();

            if (!error && data) {
                setProducts(prev => [...prev, data[0]]);
            }
        }
        setShowModal(false);
    };

    const handleDeleteProduct = async (id) => {
        await supabase
            .from('products')
            .delete()
            .eq('id', id);

        setProducts(prev => prev.filter(p => p.id !== id));
    };

    return (
        <>
            <div className="admin__section-header">
                <h2 className="admin__section-title">All Products ({products.length})</h2>
                <input
                    className="admin__search"
                    type="text"
                    placeholder="Search products…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <button className="admin__add-btn" onClick={openAddModal}>+ Add Product</button>
            </div>
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: isSupabaseConnected ? '#d4edda' : '#fff3cd', borderRadius: '4px', fontSize: '0.875rem', border: '1px solid' + (isSupabaseConnected ? '#c3e6cb' : '#ffeeba') }}>
                {isSupabaseConnected ? '✅ Connected to Supabase - Products are loaded from database' : '⚠️ Using local data - Supabase not connected or table not set up'}
            </div>
            <div className="admin__table-wrap">
                <table className="admin__table">
                    <thead>
                        <tr>
                            <th>Product</th><th>Type</th><th>Price</th><th>Stock</th><th>Tag</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.filter(product => {
                            if (!searchTerm) return true;
                            const q = searchTerm.toLowerCase();
                            return [product.name, product.type, product.tag].some(val => String(val ?? '').toLowerCase().includes(q));
                        }).map(product => (
                            <tr key={product.id}>
                                <td>
                                    <div className="admin__table-product">
                                        <div className="admin__table-thumb" />
                                        <span className="admin__table-name">{product.name}</span>
                                    </div>
                                </td>
                                <td>{product.type}</td>
                                <td style={{ fontWeight: 700 }}>₱{product.price.toFixed(2)}</td>
                                <td>{product.stock > 0 ? product.stock : <span style={{ color: 'rgba(0,0,0,0.3)' }}>Made to order</span>}</td>
                                <td><span className={badgeClass(product.tag)}>{product.tag}</span></td>
                                <td>
                                    <div className="admin__actions">
                                        <button className="admin__action-btn" onClick={() => openEditModal(product)}>Edit</button>
                                        <button className="admin__action-btn admin__action-btn--danger" onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="admin__modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="admin__modal" onClick={e => e.stopPropagation()}>
                        <div className="admin__modal-header">
                            <h2>{editProduct ? 'Edit Product' : 'Add Product'}</h2>
                            <button className="admin__modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="admin__modal-body">
                            <div className="admin__form-group">
                                <label>Product Name</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Classic Black Lanyard" />
                            </div>
                            <div className="admin__form-row">
                                <div className="admin__form-group">
                                    <label>Type</label>
                                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option>Standard Lanyards</option>
                                        <option>Custom Lanyards</option>
                                    </select>
                                </div>
                                <div className="admin__form-group">
                                    <label>Tag</label>
                                    <select value={formData.tag} onChange={e => setFormData({ ...formData, tag: e.target.value })}>
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
                                    <input type="number" min="0" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="e.g. 120" />
                                </div>
                                <div className="admin__form-group">
                                    <label>Stock</label>
                                    <input type="number" min="0" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} placeholder="0 = made to order" />
                                </div>
                            </div>
                        </div>
                        <div className="admin__modal-footer">
                            <button className="admin__modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="admin__modal-save" onClick={handleSaveProduct}>{editProduct ? 'Save Changes' : 'Add Product'}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminProducts;
