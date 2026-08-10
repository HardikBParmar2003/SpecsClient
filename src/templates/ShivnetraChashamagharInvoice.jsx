import React from 'react';
import { shopConfig } from '../config/shop';

const ShivnetraChashamagharInvoice = React.forwardRef(({ order }, ref) => {
  if (!order) return null;

  const framePrice = parseFloat(order.frame_price || 0);
  const glassPrice = parseFloat(order.glass_price || 0);
  const discount = parseFloat(order.discount || 0);
  const advance = parseFloat(order.advance || 0);
  const advanceOnline = parseFloat(order.advance_online || 0);
  const totalAdvance = advance + advanceOnline;
  const finalTotal = parseFloat(order.amount !== undefined ? order.amount : order.total_price || 0);
  const calculatedSubTotal = framePrice + glassPrice;
  const subTotal = calculatedSubTotal > 0 ? calculatedSubTotal : (finalTotal + discount);
  const balance = Math.max(0, finalTotal - totalAdvance);

  const dateStr = new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  // Theme Colors
  const primaryColor = '#1e3a8a'; // Deep Navy Blue
  const accentColor = '#d4af37'; // Luxury Gold
  const textColor = '#333333';
  const lightBg = '#f8fafc';
  const borderColor = '#e2e8f0';

  return (
    <div ref={ref} className="p-8" style={{ width: '800px', fontFamily: 'sans-serif', margin: '0 auto', fontSize: '14px', backgroundColor: '#ffffff', color: textColor }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `3px solid ${primaryColor}`, paddingBottom: '20px', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', color: accentColor, fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{shopConfig.shopName}</h1>
          {/* <p style={{ margin: '5px 0 0 0', fontSize: '16px', color: accentColor, fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>{shopConfig.shopName}</p> */}
          <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#666' }}>Shop no g-1 shiv shakti blessing near by nirmal plaza</p>
          <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#666' }}>Sanskar mandal thi rammantra road, Bhavnagar 364002</p>
          <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#666' }}>Mo: +91 97377 61917</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h1 style={{ margin: 0, fontSize: '20px', color: accentColor, fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{shopConfig.reminderShopName}</h1>
          {/* <p style={{ margin: '5px 0 0 0', fontSize: '16px', color: accentColor, fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>{shopConfig.shopName}</p> */}
          <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#666' }}>શોપ નં: જી-૧, શિવ શક્તિ બ્લેસિંગ, નિર્મલ પ્લાઝા ની બાજુમા,</p>
          <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#666' }}>સંસ્કાર મંડળ થી રામમંત્ર મંદિર રોડ, ભાવનગર - ૩૬૪૦૦૨</p>
          <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#666' }}>Mo: +91 97377 61917</p>
        </div>
      </div>

      {/* Customer Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', backgroundColor: lightBg, padding: '20px', borderRadius: '8px', borderLeft: `4px solid ${accentColor}` }}>
        <div>
          <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Customer Name:</p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: primaryColor }}>{order.customerName || order.user?.name || 'Customer'}</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>Mobile: {order.mobile || order.customer_mobile || order.customerMobile || order.user?.mobile || 'N/A'}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: '2px 0 0 0', fontSize: '14px' }}><strong>Date:</strong> {dateStr}</p>
          {order.bill_number && <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}><strong>Bill No:</strong> {order.bill_number}</p>}
        </div>
      </div>

      {/* Measurement Table (if exists) */}
      {order.measurements && order.measurements.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '16px', color: primaryColor, borderBottom: `2px solid ${borderColor}`, paddingBottom: '8px', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>Measurements</h3>
          {order.measurements.map((p, idx) => (
            <table key={idx} style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <thead style={{ backgroundColor: primaryColor, color: '#ffffff' }}>
                <tr>
                  <th style={{ padding: '10px', fontWeight: 'normal', fontSize: '12px', letterSpacing: '1px' }}>PART</th>
                  <th style={{ padding: '10px', fontWeight: 'normal', fontSize: '12px', letterSpacing: '1px' }}>LENGTH</th>
                  <th style={{ padding: '10px', fontWeight: 'normal', fontSize: '12px', letterSpacing: '1px' }}>SHOULDER</th>
                  <th style={{ padding: '10px', fontWeight: 'normal', fontSize: '12px', letterSpacing: '1px' }}>CHEST</th>
                  <th style={{ padding: '10px', fontWeight: 'normal', fontSize: '12px', letterSpacing: '1px' }}>WAIST</th>
                  <th style={{ padding: '10px', fontWeight: 'normal', fontSize: '12px', letterSpacing: '1px' }}>SLEEVE</th>
                  <th style={{ padding: '10px', fontWeight: 'normal', fontSize: '12px', letterSpacing: '1px' }}>NECK</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ backgroundColor: '#ffffff', borderBottom: `1px solid ${borderColor}` }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: primaryColor }}>Top</td>
                  <td style={{ padding: '12px' }}>{p.top_length || '-'}</td>
                  <td style={{ padding: '12px' }}>{p.shoulder || '-'}</td>
                  <td style={{ padding: '12px' }}>{p.chest || '-'}</td>
                  <td style={{ padding: '12px' }}>{p.top_waist || '-'}</td>
                  <td style={{ padding: '12px' }}>{p.sleeve || '-'}</td>
                  <td style={{ padding: '12px' }}>{p.neck || '-'}</td>
                </tr>
                <tr style={{ backgroundColor: lightBg }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: primaryColor }}>Bottom</td>
                  <td style={{ padding: '12px' }}>{p.bottom_length || '-'}</td>
                  <td style={{ padding: '12px' }}>-</td>
                  <td style={{ padding: '12px' }}>{p.hip ? p.hip + ' (Hip)' : '-'}</td>
                  <td style={{ padding: '12px' }}>{p.bottom_waist || '-'}</td>
                  <td style={{ padding: '12px' }}>{p.thigh ? p.thigh + ' (Thigh)' : '-'}</td>
                  <td style={{ padding: '12px' }}>{p.bottom ? p.bottom + ' (Bottom)' : '-'}</td>
                </tr>
              </tbody>
            </table>
          ))}
        </div>
      )}

      {/* Order Items */}
      {order.order_items && order.order_items.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '16px', color: primaryColor, borderBottom: `2px solid ${borderColor}`, paddingBottom: '8px', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>Order Details</h3>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: lightBg, borderBottom: `2px solid ${borderColor}` }}>
              <tr>
                <th style={{ padding: '12px', color: '#666', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Item Description</th>
                <th style={{ padding: '12px', color: '#666', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: `1px solid ${borderColor}` }}>
                  <td style={{ padding: '15px 12px' }}>
                    <div style={{ fontWeight: 'bold', color: primaryColor, fontSize: '15px' }}>{item.custom_item_name || item.product?.name || item.product_name || 'Custom Outfit'}</div>
                    {item.fabric_type && <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>Lens Type: {item.fabric_type}</div>}
                  </td>
                  <td style={{ padding: '15px 12px', textAlign: 'right', fontWeight: 'bold' }}>₹{parseFloat(item.unit_price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Financial Summary */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
        <div style={{ width: '350px', backgroundColor: lightBg, padding: '20px', borderRadius: '8px' }}>
          <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px 0', color: '#666' }}>Material Cost:</td>
                <td style={{ padding: '8px 0', fontWeight: 'bold' }}>₹{framePrice.toFixed(2)}</td>
              </tr>
              {/* <tr>
                <td style={{ padding: '8px 0', color: '#666' }}>Making Charge:</td>
                <td style={{ padding: '8px 0', fontWeight: 'bold' }}>₹{glassPrice.toFixed(2)}</td>
              </tr> */}
              <tr>
                <td style={{ padding: '8px 0', color: '#666', borderTop: `1px solid ${borderColor}` }}>Sub Total:</td>
                <td style={{ padding: '8px 0', fontWeight: 'bold', borderTop: `1px solid ${borderColor}` }}>₹{subTotal.toFixed(2)}</td>
              </tr>
              {discount > 0 && (
                <tr>
                  <td style={{ padding: '8px 0', color: '#dc2626' }}>Discount:</td>
                  <td style={{ padding: '8px 0', color: '#dc2626', fontWeight: 'bold' }}>-₹{discount.toFixed(2)}</td>
                </tr>
              )}
              <tr>
                <td style={{ padding: '12px 0', color: primaryColor, fontWeight: 'bold', fontSize: '18px', borderTop: `2px solid ${primaryColor}` }}>Total Amount:</td>
                <td style={{ padding: '12px 0', color: primaryColor, fontWeight: 'bold', fontSize: '18px', borderTop: `2px solid ${primaryColor}` }}>₹{finalTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer */}
      {/* <div style={{ marginTop: '50px', textAlign: 'center', borderTop: `1px solid ${borderColor}`, paddingTop: '20px' }}>
        <p style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold', color: primaryColor }}>{shopConfig.shopName}</p>
        {shopConfig.address && (
          <p style={{ margin: '0 0 3px 0', fontSize: '12px', color: '#666' }}>{shopConfig.address}</p>
        )}
        {shopConfig.phone && (
          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Contact: {shopConfig.phone}</p>
        )}
      </div> */}
    </div>
  );
});

export default ShivnetraChashamagharInvoice;
