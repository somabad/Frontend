import React, { useState } from 'react';

const LateModal = ({ show, onClose, onSubmitReason }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const handleReasonChange = (e) => {
    const reason = e.target.value;
    setSelectedReason(reason);
    setCustomReason(''); // clear input on change
  };

  const handleSubmit = () => {
    let reasonToSubmit = selectedReason === 'Others' ? customReason : selectedReason;
    if (onSubmitReason && reasonToSubmit) {
      onSubmitReason(reasonToSubmit); // Send final reason
    }
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '10px',
          width: '90%',
          maxWidth: '400px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        }}
      >
        <h2 style={{ marginBottom: '1rem' }}>Why are you late?</h2>

        <form>
          {['Half Day', 'Sick', 'Traffic', 'Others'].map((reason) => (
            <label key={reason} style={{ display: 'block', marginBottom: '0.5rem' }}>
              <input
                type="radio"
                name="reason"
                value={reason}
                checked={selectedReason === reason}
                onChange={handleReasonChange}
                style={{ marginRight: '0.5rem' }}
              />
              {reason}
            </label>
          ))}

          {selectedReason === 'Others' && (
            <input
              type="text"
              placeholder="Please enter your reason"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                marginTop: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          )}
        </form>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button
            onClick={handleSubmit}
            disabled={
              !selectedReason || (selectedReason === 'Others' && customReason.trim() === '')
            }
            style={{
              backgroundColor: '#7B61FF',
              color: '#fff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default LateModal;
