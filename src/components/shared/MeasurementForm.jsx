import React from 'react';

const MeasurementForm = ({ measurement, setMeasurement }) => {
  const handleChange = (e, field) => {
    setMeasurement({
      ...measurement,
      [field]: e.target.value
    });
  };

  const renderInput = (label, field) => (
    <div>
      <label className="block text-xs text-[var(--text-muted)] mb-1">{label}</label>
      <input
        type="text"
        className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-3 py-2 text-[var(--input-text)] focus:outline-none focus:border-luxury-gold transition-colors text-sm"
        value={measurement[field] || ''}
        onChange={(e) => handleChange(e, field)}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shirt / Top Measurements */}
        <div className="glassmorphism p-4 rounded-lg">
          <h4 className="text-luxury-gold font-medium mb-4 uppercase tracking-wider text-sm border-b border-[var(--border-color)] pb-2">Top / Shirt</h4>
          <div className="grid grid-cols-2 gap-4">
            {renderInput('Length', 'top_length')}
            {renderInput('Shoulder', 'shoulder')}
            {renderInput('Chest', 'chest')}
            {renderInput('Waist', 'top_waist')}
            {renderInput('Sleeve', 'sleeve')}
            {renderInput('Neck', 'neck')}
          </div>
        </div>

        {/* Trouser / Bottom Measurements */}
        <div className="glassmorphism p-4 rounded-lg">
          <h4 className="text-luxury-gold font-medium mb-4 uppercase tracking-wider text-sm border-b border-[var(--border-color)] pb-2">Bottom / Trouser</h4>
          <div className="grid grid-cols-2 gap-4">
            {renderInput('Length', 'bottom_length')}
            {renderInput('Waist', 'bottom_waist')}
            {renderInput('Hip', 'hip')}
            {renderInput('Thigh', 'thigh')}
            {renderInput('Bottom', 'bottom')}
            {renderInput('Inseam', 'inseam')}
          </div>
        </div>
      </div>
      
      {/* Measurement Notes */}
      <div className="glassmorphism p-4 rounded-lg mt-4">
        <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Special Instructions / Notes</label>
        <textarea
          rows="2"
          value={measurement.notes || ''}
          onChange={(e) => setMeasurement({ ...measurement, notes: e.target.value })}
          placeholder="Add any specific design instructions or notes..."
          className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-3 py-2 text-[var(--input-text)] focus:outline-none focus:border-luxury-gold transition-colors text-sm"
        />
      </div>
    </div>
  );
};

export default MeasurementForm;
