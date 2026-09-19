import React from 'react';

const MeasurementForm = ({ measurement, setMeasurement }) => {
  const handleChange = (e, field) => {
    setMeasurement({
      ...measurement,
      [field]: e.target.value
    });
  };

  const renderInput = (label, field) => (
    <div className="relative group">
      <label className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1 group-focus-within:text-luxury-gold transition-colors">
        {label}
      </label>
      <input
        type="text"
        className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-md px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold/50 transition-all text-sm shadow-sm"
        value={measurement[field] || ''}
        onChange={(e) => handleChange(e, field)}
      />
    </div>
  );

  return (
    <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Left Column: Top / Shirt Measurements */}
        <div>
          <div className="flex items-center gap-3 mb-6 border-b border-[var(--border-color)] pb-3">
            <div className="w-8 h-8 rounded-full bg-luxury-gold/10 flex items-center justify-center text-luxury-gold">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h4 className="text-luxury-gold font-medium uppercase tracking-widest text-sm">Top / Shirt</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            {renderInput('Length', 'top_length')}
            {renderInput('Chest', 'chest')}
            {renderInput('Waist', 'top_waist')}
            {renderInput('Shoulder', 'shoulder')}
            {renderInput('Sleeves', 'sleeves')}
            {renderInput('Neck', 'neck')}
          </div>
        </div>

        {/* Right Column: Bottom / Trouser Measurements */}
        <div>
          <div className="flex items-center gap-3 mb-6 border-b border-[var(--border-color)] pb-3">
            <div className="w-8 h-8 rounded-full bg-luxury-gold/10 flex items-center justify-center text-luxury-gold">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
            </div>
            <h4 className="text-luxury-gold font-medium uppercase tracking-widest text-sm">Bottom / Trouser</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            {renderInput('Length', 'bottom_length')}
            {renderInput('Waist', 'bottom_waist')}
            {renderInput('Hips', 'hips')}
            {renderInput('Thigh', 'thigh')}
            {renderInput('Bottom', 'bottom')}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default MeasurementForm;
