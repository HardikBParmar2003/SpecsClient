import React from 'react';

const PrescriptionForm = ({ prescription, setPrescription }) => {
  const handleChange = (e, eye, field) => {
    setPrescription({
      ...prescription,
      [`${eye}_${field}`]: e.target.value
    });
  };

  const renderInput = (label, eye, field) => (
    <div>
      <label className="block text-xs text-[var(--text-muted)] mb-1">{label}</label>
      <input
        type="number"
        step="0.25"
        className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-3 py-2 text-[var(--input-text)] focus:outline-none focus:border-luxury-gold transition-colors text-sm"
        value={prescription[`${eye}_${field}`] || ''}
        onChange={(e) => handleChange(e, eye, field)}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Right Eye (OD) */}
        <div className="glassmorphism p-4 rounded-lg">
          <h4 className="text-luxury-gold font-medium mb-4 uppercase tracking-wider text-sm border-b border-[var(--border-color)] pb-2">Right Eye (OD)</h4>
          <div className="grid grid-cols-2 gap-4">
            {renderInput('SPH', 'od', 'sphere')}
            {renderInput('CYL', 'od', 'cylinder')}
            {renderInput('AXIS', 'od', 'axis')}
            {renderInput('ADD', 'od', 'add')}
            <div className="col-span-2">
               {renderInput('PD', 'od', 'pd')}
            </div>
          </div>
        </div>

        {/* Left Eye (OS) */}
        <div className="glassmorphism p-4 rounded-lg">
          <h4 className="text-luxury-gold font-medium mb-4 uppercase tracking-wider text-sm border-b border-[var(--border-color)] pb-2">Left Eye (OS)</h4>
          <div className="grid grid-cols-2 gap-4">
            {renderInput('SPH', 'os', 'sphere')}
            {renderInput('CYL', 'os', 'cylinder')}
            {renderInput('AXIS', 'os', 'axis')}
            {renderInput('ADD', 'os', 'add')}
            <div className="col-span-2">
              {renderInput('PD', 'os', 'pd')}
            </div>
          </div>
        </div>
      </div>
      
      {/* Eye Description / Notes */}
      <div className="glassmorphism p-4 rounded-lg mt-4">
        <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Eye Description / Notes</label>
        <textarea
          rows="2"
          value={prescription.notes || ''}
          onChange={(e) => setPrescription({ ...prescription, notes: e.target.value })}
          placeholder="Add any specific description or notes for this eye prescription..."
          className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-3 py-2 text-[var(--input-text)] focus:outline-none focus:border-luxury-gold transition-colors text-sm"
        />
      </div>
    </div>
  );
};

export default PrescriptionForm;
