import React from 'react';
import { shopConfig } from '../config/shop';

const CityPalaxeInvoice = React.forwardRef(({ order }, ref) => {
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

  let frameName = 'FRAME';
  let glassName = 'GLASS';

  if (order.order_items && order.order_items.length > 0) {
    const item = order.order_items[0];
    if (item.custom_frame_name || item.product?.name || item.product_name) {
      frameName = (item.custom_frame_name || item.product?.name || item.product_name).toUpperCase();
    }
    if (item.glass_type) {
      glassName = item.glass_type.toUpperCase();
    }
  }

  const dateStr = new Date(order.created_at).toLocaleDateString('en-GB');

  return (
    <div ref={ref} style={{ width: '800px', padding: '32px', fontFamily: 'Arial, sans-serif', margin: '0 auto', fontSize: '13px', backgroundColor: '#ffffff', color: '#000', boxSizing: 'border-box' }}>
      
      <div style={{ border: '2px solid #1e3a8a' }}>
        {/* Header Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: '#f0f4f8', color: '#1e3a8a', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ fontWeight: 'bold' }}>Irshad : {shopConfig.phone_1 || '9825707708'}</div>
          <div style={{ fontWeight: 'bold' }}>Jabir : {shopConfig.phone_2 || '9727288438'}</div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#1e3a8a' }}>{shopConfig.shopName || 'Optic Palace'}</h1>
        </div>
        
        {/* Subtitle / Address Box */}
        <div style={{ display: 'block', textAlign: 'center', marginBottom: '16px', padding: '12px 8px', fontSize: '14px', fontWeight: 'bold', backgroundColor: '#1e3a8a', color: '#ffffff', lineHeight: 1.4 }}>
          {shopConfig.address ? shopConfig.address.toUpperCase() : ''}
        </div>

      {/* Customer & Bill Details */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', padding: '0 15px', fontSize: '13px' }}>
        <div style={{ width: '60%' }}>
          <div style={{ display: 'flex', marginBottom: '4px' }}>
            <div style={{ width: '50px', fontWeight: 'bold' }}>M/s.</div>
            <div style={{ width: '10px', fontWeight: 'bold' }}>:</div>
            <div style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{order.customerName || order.user?.name || 'Customer'}</div>
          </div>

          <div style={{ display: 'flex', marginBottom: '4px' }}>
            <div style={{ width: '50px', fontWeight: 'bold' }}>Mob.</div>
            <div style={{ width: '10px', fontWeight: 'bold' }}>:</div>
            <div style={{ fontWeight: 'bold' }}>{order.mobile || order.customer_mobile || order.customerMobile || order.user?.mobile || ''}</div>
          </div>
        </div>
        <div style={{ width: '35%' }}>
          <div style={{ display: 'flex', marginBottom: '10px' }}>
            <div style={{ width: '80px', fontWeight: 'bold' }}>DATE</div>
            <div style={{ width: '10px', fontWeight: 'bold' }}>:</div>
            <div style={{ fontWeight: 'bold' }}>{dateStr}</div>
          </div>
          {order.bill_number && (
            <div style={{ display: 'flex', marginBottom: '4px' }}>
              <div style={{ width: '80px', fontWeight: 'bold' }}>BILL NO.</div>
              <div style={{ width: '10px', fontWeight: 'bold' }}>:</div>
              <div style={{ fontWeight: 'bold' }}>{order.bill_number}</div>
            </div>
          )}
        </div>
      </div>

      {/* Reference */}
      <div style={{ padding: '0 15px', marginBottom: '10px', fontSize: '13px', fontWeight: 'bold', display: 'flex' }}>
        {/* <div style={{ width: '90px' }}>Refrence</div> */}
        {/* <div style={{ width: '10px' }}>:</div> */}
        {/* <div>{order.reference || 'TAKHTSINHJI HOSPITAL'}</div> */}
      </div>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', borderLeft: 'none', borderRight: 'none', marginBottom: '0px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f4f8', color: '#1e3a8a' }}>
            <th style={{ border: '1px solid #000', borderLeft: 'none', padding: '6px', width: '5%', textAlign: 'center', fontSize: '14px' }}>Sr.</th>
            <th style={{ border: '1px solid #000', padding: '6px', width: '45%', textAlign: 'center', fontSize: '14px' }}>Description</th>
            <th style={{ border: '1px solid #000', padding: '6px', width: '10%', textAlign: 'center', fontSize: '14px' }}>Qty.</th>
            <th style={{ border: '1px solid #000', padding: '6px', width: '20%', textAlign: 'center', fontSize: '14px' }}>Rate</th>
            <th style={{ border: '1px solid #000', borderRight: 'none', padding: '6px', width: '20%', textAlign: 'center', fontSize: '14px' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ borderLeft: 'none', borderRight: '1px solid #000', padding: '6px', textAlign: 'center' }}>1</td>
            <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '6px', textAlign: 'left' }}>{frameName}</td>
            <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '6px', textAlign: 'center' }}>1</td>
            <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '6px', textAlign: 'right' }}>{framePrice.toFixed(2)}</td>
            <td style={{ borderLeft: '1px solid #000', borderRight: 'none', padding: '6px', textAlign: 'right' }}>{framePrice.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={{ borderLeft: 'none', borderRight: '1px solid #000', padding: '6px', textAlign: 'center' }}>2</td>
            <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '6px', textAlign: 'left' }}>{glassName}</td>
            <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '6px', textAlign: 'center' }}>1</td>
            <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '6px', textAlign: 'right' }}>{glassPrice.toFixed(2)}</td>
            <td style={{ borderLeft: '1px solid #000', borderRight: 'none', padding: '6px', textAlign: 'right' }}>{glassPrice.toFixed(2)}</td>
          </tr>
          {/* Fill empty space so the table has a minimum height */}
          {[...Array(5)].map((_, i) => (
            <tr key={`empty-${i}`}>
              <td style={{ borderLeft: 'none', borderRight: '1px solid #000', padding: '10px 6px' }}>&nbsp;</td>
              <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '10px 6px' }}>&nbsp;</td>
              <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '10px 6px' }}>&nbsp;</td>
              <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '10px 6px' }}>&nbsp;</td>
              <td style={{ borderLeft: '1px solid #000', borderRight: 'none', padding: '10px 6px' }}>&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Section */}
      <div style={{ backgroundColor: '#fdf8f6' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #000', padding: '6px 10px' }}>
          <div style={{ width: '80%', textAlign: 'right', fontWeight: 'bold', fontSize: '15px', paddingRight: '20px' }}>Total :</div>
          <div style={{ width: '20%', textAlign: 'right', fontWeight: 'bold', fontSize: '15px' }}>{subTotal.toFixed(2)}</div>
        </div>
        {discount > 0 && (
          <div style={{ display: 'flex', padding: '6px 10px' }}>
            <div style={{ width: '80%', textAlign: 'right', fontWeight: 'bold', fontSize: '15px', paddingRight: '20px' }}>Discount :</div>
            <div style={{ width: '20%', textAlign: 'right', fontWeight: 'bold', fontSize: '15px' }}>-{discount.toFixed(2)}</div>
          </div>
        )}
        <div style={{ display: 'flex', padding: '6px 10px' }}>
          <div style={{ width: '80%', textAlign: 'right', fontWeight: 'bold', fontSize: '15px', paddingRight: '20px' }}>Advance :</div>
          <div style={{ width: '20%', textAlign: 'right', fontWeight: 'bold', fontSize: '15px' }}>{totalAdvance.toFixed(2)}</div>
        </div>
        <div style={{ display: 'flex', borderTop: '1px solid #000', padding: '8px 10px', backgroundColor: '#f0f4f8' }}>
          <div style={{ width: '50%', textTransform: 'uppercase', fontSize: '14px', fontWeight: 'bold' }}>{order.customerName || order.user?.name || 'CUSTOMER'}</div>
          <div style={{ width: '30%', textAlign: 'right', fontWeight: 'bold', fontSize: '15px', paddingRight: '20px', color: '#b91c1c' }}>Due Amount :</div>
          <div style={{ width: '20%', textAlign: 'right', fontWeight: 'bold', fontSize: '16px', color: '#b91c1c' }}>{balance.toFixed(2)}</div>
        </div>
      </div>

      {/* Prescription Table */}
      {order.eye_prescriptions && order.eye_prescriptions.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', borderLeft: 'none', borderRight: 'none', borderBottom: 'none', textAlign: 'center' }}>
          <thead>
            <tr style={{ backgroundColor: '#1e3a8a', color: '#ffffff' }}>
              <th style={{ border: '1px solid #000', borderLeft: 'none', borderTop: '1px solid #000', padding: '8px 10px', fontWeight: 'bold', fontSize: '13px', textAlign: 'left', width: '20%' }}>Eye</th>
              <th style={{ border: '1px solid #000', borderTop: '1px solid #000', padding: '8px 6px', fontWeight: 'bold', fontSize: '13px', width: '20%' }}>SPH</th>
              <th style={{ border: '1px solid #000', borderTop: '1px solid #000', padding: '8px 6px', fontWeight: 'bold', fontSize: '13px', width: '20%' }}>CYL</th>
              <th style={{ border: '1px solid #000', borderTop: '1px solid #000', padding: '8px 6px', fontWeight: 'bold', fontSize: '13px', width: '20%' }}>AXIS</th>
              <th style={{ border: '1px solid #000', borderRight: 'none', borderTop: '1px solid #000', padding: '8px 6px', fontWeight: 'bold', fontSize: '13px', width: '20%' }}>ADD</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', borderLeft: 'none', padding: '10px', fontWeight: 'bold', fontSize: '13px', textAlign: 'left', color: '#1e3a8a' }}>Right (OD)</td>
              <td style={{ border: '1px solid #000', padding: '10px 6px', fontSize: '13px' }}>{order.eye_prescriptions[0].od_sphere || '-'}</td>
              <td style={{ border: '1px solid #000', padding: '10px 6px', fontSize: '13px' }}>{order.eye_prescriptions[0].od_cylinder || '-'}</td>
              <td style={{ border: '1px solid #000', padding: '10px 6px', fontSize: '13px' }}>{order.eye_prescriptions[0].od_axis || '-'}</td>
              <td style={{ border: '1px solid #000', borderRight: 'none', padding: '10px 6px', fontSize: '13px' }}>{order.eye_prescriptions[0].od_add || '-'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', borderLeft: 'none', padding: '10px', fontWeight: 'bold', fontSize: '13px', textAlign: 'left', color: '#1e3a8a' }}>Left (OS)</td>
              <td style={{ border: '1px solid #000', padding: '10px 6px', fontSize: '13px' }}>{order.eye_prescriptions[0].os_sphere || '-'}</td>
              <td style={{ border: '1px solid #000', padding: '10px 6px', fontSize: '13px' }}>{order.eye_prescriptions[0].os_cylinder || '-'}</td>
              <td style={{ border: '1px solid #000', padding: '10px 6px', fontSize: '13px' }}>{order.eye_prescriptions[0].os_axis || '-'}</td>
              <td style={{ border: '1px solid #000', borderRight: 'none', padding: '10px 6px', fontSize: '13px' }}>{order.eye_prescriptions[0].os_add || '-'}</td>
            </tr>
          </tbody>
        </table>
      )}

      {/* Footer Box */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 15px', borderTop: '1px solid #000', fontSize: '13px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ marginBottom: '30px' }}>E. & O. E.</div>
          <div>Thanks. Visit Again.</div>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '30px', fontSize: '15px' }}>For, {shopConfig.shopName || 'City Optic Palace'}</div>
        </div>
      </div>
      
    </div>
  </div>
  );
});

export default CityPalaxeInvoice;
