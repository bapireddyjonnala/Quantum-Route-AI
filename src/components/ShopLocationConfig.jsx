import React, { useState, useEffect } from 'react';
import { Store, MapPin, Search, CheckCircle, AlertTriangle, RefreshCw, Save } from 'lucide-react';
import { useOptimization } from '../context/OptimizationContext';
import { optimizationApi } from '../api/optimizationApi';

export const ShopLocationConfig = () => {
  const { shopLocation, saveShopLocation, backendOnline } = useOptimization();

  const [formData, setFormData] = useState({
    shop_name: '',
    address: '',
    latitude: '',
    longitude: ''
  });

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }

  // Sync form data with context shopLocation
  useEffect(() => {
    if (shopLocation) {
      setFormData({
        shop_name: shopLocation.shop_name || '',
        address: shopLocation.address || '',
        latitude: shopLocation.latitude !== undefined ? String(shopLocation.latitude) : '',
        longitude: shopLocation.longitude !== undefined ? String(shopLocation.longitude) : ''
      });
    }
  }, [shopLocation]);

  const handleGeocode = async () => {
    if (!formData.address.trim()) {
      setMessage({ type: 'error', text: 'Please enter a shop address to geocode.' });
      return;
    }

    setIsGeocoding(true);
    setMessage(null);

    try {
      const geoResult = await optimizationApi.geocodeAddress(formData.address);
      setFormData(prev => ({
        ...prev,
        latitude: String(geoResult.latitude),
        longitude: String(geoResult.longitude)
      }));
      setMessage({
        type: 'success',
        text: `Geocoded coordinates: Lat ${geoResult.latitude.toFixed(4)}, Lng ${geoResult.longitude.toFixed(4)}`
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'Geocoding failed. Please check the address or enter coordinates manually.'
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.shop_name.trim()) {
      setMessage({ type: 'error', text: 'Please enter a Shop / Warehouse Name.' });
      return;
    }
    if (!formData.address.trim()) {
      setMessage({ type: 'error', text: 'Please enter a Shop / Warehouse Address.' });
      return;
    }

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setMessage({ type: 'error', text: 'Please provide valid Latitude and Longitude values or click "Geocode Address".' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      await saveShopLocation({
        shop_name: formData.shop_name.trim(),
        address: formData.address.trim(),
        latitude: lat,
        longitude: lng
      });
      setMessage({
        type: 'success',
        text: 'Shop / Warehouse location saved successfully! All vehicles will now start and return to this address.'
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to save shop location.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isConfigured = shopLocation && shopLocation.shop_name && shopLocation.address && typeof shopLocation.latitude === 'number';

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <h2 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Store size={22} color="var(--primary-blue)" />
          Shop / Warehouse Location Configuration
        </h2>

        {isConfigured ? (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            fontWeight: 700,
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '3px 10px',
            borderRadius: '12px'
          }}>
            <CheckCircle size={13} />
            Shop Configured ({shopLocation.shop_name})
          </span>
        ) : (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            fontWeight: 700,
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '3px 10px',
            borderRadius: '12px'
          }}>
            <AlertTriangle size={13} />
            Configuration Required
          </span>
        )}
      </div>

      {/* Requirement 13: UI explanation */}
      <div style={{
        background: '#0f172a',
        border: '1px solid var(--border-color)',
        borderLeft: '4px solid var(--primary-blue)',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '0.85rem',
        color: 'var(--text-main)',
        marginBottom: '20px',
        lineHeight: 1.5
      }}>
        ℹ️ <strong>Delivery Routing Rule:</strong> Vehicles start from the configured shop/warehouse, deliver assigned orders in the optimized sequence, and return to the shop.
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: message.type === 'success' ? '#34d399' : '#f87171',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
        }}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Shop / Warehouse Name *
            </label>
            <input
              type="text"
              placeholder="e.g. My Vijayawada Central Shop"
              value={formData.shop_name}
              onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Shop / Warehouse Address *
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="e.g. MG Road, Vijayawada, Andhra Pradesh"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                style={{ flexGrow: 1, padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
                required
              />
              <button
                type="button"
                onClick={handleGeocode}
                disabled={isGeocoding || !formData.address.trim()}
                className="btn btn-secondary"
                style={{
                  padding: '9px 14px',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
                title="Convert address to GPS coordinates using OpenStreetMap Nominatim"
              >
                {isGeocoding ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Geocoding…
                  </>
                ) : (
                  <>
                    <Search size={14} />
                    Geocode Address
                  </>
                )}
              </button>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Uses free OpenStreetMap Nominatim geocoding engine.
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Latitude *
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 16.5062"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Longitude *
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 80.6480"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving || !backendOnline}
          className="btn btn-primary"
          style={{
            padding: '10px 20px',
            fontSize: '0.9rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {isSaving ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Saving Shop Location…
            </>
          ) : (
            <>
              <Save size={16} />
              Save Shop Location
            </>
          )}
        </button>
      </form>
    </div>
  );
};
