import React from 'react';
import { shopConfig } from '../config/shop';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

const TailorInvoice = React.forwardRef(({ order }, ref) => {
  const dbSettings = useLiveQuery(() => db.settings.where({ key: 'shopSettings' }).first());
  
  if (!order) return null;

  const customShopConfig = dbSettings?.value ? { ...shopConfig, ...dbSettings.value } : shopConfig;

  const framePrice = parseFloat(order.fabric_price || 0);
  const glassPrice = parseFloat(order.stitching_price || 0);
  const discount = parseFloat(order.discount || 0);
  const advance = parseFloat(order.advance || 0);
  
  const finalTotal = parseFloat(order.amount !== undefined ? order.amount : order.total_price || 0);
  const calculatedSubTotal = framePrice + glassPrice;
  const subTotal = calculatedSubTotal > 0 ? calculatedSubTotal : (finalTotal + discount);
  const balance = Math.max(0, finalTotal - advance);

  let fabricName = 'FABRIC';
  let stitchingName = 'STITCHING';

  if (order.order_items && order.order_items.length > 0) {
    const item = order.order_items[0];
    if (item.custom_item_name || item.product?.name || item.product_name) {
      fabricName = (item.custom_item_name || item.product?.name || item.product_name).toUpperCase();
    }
    if (item.stitching_type) {
      stitchingName = item.stitching_type.toUpperCase();
    }
  }

  const dateStr = new Date(order.created_at).toLocaleDateString('en-GB');

  return (
    <div ref={ref} style={{ width: '800px', padding: '32px', fontFamily: 'Arial, sans-serif', margin: '0 auto', fontSize: '13px', backgroundColor: '#ffffff', color: '#000', boxSizing: 'border-box' }}>
      
      <div style={{ border: '2px solid #1e3a8a' }}>
        {/* Header Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: '#f0f4f8', color: '#1e3a8a', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ fontWeight: 'bold' }}>Phone: {customShopConfig.phone_1 || '9876543210'}</div>
          {customShopConfig.phone_2 && <div style={{ fontWeight: 'bold' }}>Alt Phone: {customShopConfig.phone_2}</div>}
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '12px', marginTop: '12px' }}>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#1e3a8a', textTransform: 'uppercase' }}>{customShopConfig.shopName || 'Custom Fits Tailor'}</h1>
        </div>
        
        {/* Subtitle / Address Box */}
        <div style={{ display: 'block', textAlign: 'center', marginBottom: '12px', padding: '6px 8px', fontSize: '14px', fontWeight: 'bold', backgroundColor: '#1e3a8a', color: '#ffffff', lineHeight: 1.4 }}>
          {customShopConfig.address ? customShopConfig.address.toUpperCase() : 'TAILOR SHOP ADDRESS'}
        </div>

      {/* Customer & Bill Details */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', padding: '0 15px', fontSize: '13px' }}>
        <div style={{ width: '60%' }}>
          <div style={{ display: 'flex', marginBottom: '4px' }}>
            <div style={{ width: '50px', fontWeight: 'bold' }}>M/s.</div>
            <div style={{ width: '10px', fontWeight: 'bold' }}>:</div>
            <div style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{order.customer_name || order.customerName || order.user?.name || 'Customer'}</div>
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


      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', borderLeft: 'none', borderRight: 'none', marginBottom: '0px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f4f8', color: '#1e3a8a' }}>
            <th style={{ border: '1px solid #000', borderLeft: 'none', padding: '6px', width: '10%', textAlign: 'center', fontSize: '14px' }}>Sr.</th>
            <th style={{ border: '1px solid #000', padding: '6px', width: '70%', textAlign: 'center', fontSize: '14px' }}>Description</th>
            <th style={{ border: '1px solid #000', borderRight: 'none', padding: '6px', width: '20%', textAlign: 'center', fontSize: '14px' }}>Qty.</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ borderLeft: 'none', borderRight: '1px solid #000', padding: '6px', textAlign: 'center' }}>1</td>
            <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '6px', textAlign: 'left' }}>Shirts</td>
            <td style={{ borderLeft: '1px solid #000', borderRight: 'none', padding: '6px', textAlign: 'center' }}>{order.shirt_qty || 0}</td>
          </tr>
          <tr>
            <td style={{ borderLeft: 'none', borderRight: '1px solid #000', padding: '6px', textAlign: 'center' }}>2</td>
            <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '6px', textAlign: 'left' }}>Pants</td>
            <td style={{ borderLeft: '1px solid #000', borderRight: 'none', padding: '6px', textAlign: 'center' }}>{order.pant_qty || 0}</td>
          </tr>
          {/* Fill empty space so the table has a minimum height */}
          {[...Array(4)].map((_, i) => (
            <tr key={`empty-${i}`}>
              <td style={{ borderLeft: 'none', borderRight: '1px solid #000', padding: '10px 6px' }}>&nbsp;</td>
              <td style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000', padding: '10px 6px' }}>&nbsp;</td>
              <td style={{ borderLeft: '1px solid #000', borderRight: 'none', padding: '10px 6px' }}>&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Section */}
      <div style={{ backgroundColor: '#fdf8f6' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #000', padding: '8px 10px' }}>
          <div style={{ width: '80%', textAlign: 'right', fontWeight: 'bold', fontSize: '18px', paddingRight: '20px' }}>Total :</div>
          <div style={{ width: '20%', textAlign: 'right', fontWeight: 'bold', fontSize: '18px' }}>{subTotal.toFixed(2)}</div>
        </div>
        {discount > 0 && (
          <div style={{ display: 'flex', padding: '6px 10px' }}>
            <div style={{ width: '80%', textAlign: 'right', fontWeight: 'bold', fontSize: '15px', paddingRight: '20px' }}>Discount :</div>
            <div style={{ width: '20%', textAlign: 'right', fontWeight: 'bold', fontSize: '15px' }}>-{discount.toFixed(2)}</div>
          </div>
        )}
        <div style={{ display: 'flex', borderTop: '1px solid #000', padding: '8px 10px', backgroundColor: '#f0f4f8' }}>
          <div style={{ width: '100%', textTransform: 'uppercase', fontSize: '14px', fontWeight: 'bold' }}>{order.customer_name || order.customerName || order.user?.name || 'CUSTOMER'}</div>
        </div>
      </div>



      {/* Footer Box */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 15px', borderTop: '1px solid #000', fontSize: '13px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {customShopConfig.terms ? (
             customShopConfig.terms.split('\n').map((line, idx) => (
                <div key={idx} style={{ marginBottom: '2px' }}>{line}</div>
             ))
          ) : (
            <>
              <div style={{ marginBottom: '30px' }}>E. & O. E.</div>
              <div>Thanks. Visit Again.</div>
            </>
          )}
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ fontWeight: 'bold', marginTop: '40px', fontSize: '15px' }}>For, {customShopConfig.shopName || 'Custom Fits Tailor'}</div>
        </div>
      </div>
      
    </div>
  </div>
  );
});

export default TailorInvoice;
