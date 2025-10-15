import React, { useEffect, useState, useRef } from 'react';
import { Modal, ModalBody, ModalFooter, Row, Col, FormGroup, Label, Input } from 'reactstrap';
import { getStaffLeaveDashboard } from '../../../Attendance/utils';
import { useReactToPrint } from 'react-to-print';


const BACKEND_URL = 'http://127.0.0.1:8000';

// Function to check if the filename is an image
const isImage = (filename) => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(filename || '');

// Function to get document URL from the backend
const getDocumentUrl = (doc) => {
  if (!doc) return null;
  if (doc.startsWith('http')) return doc;
  return `${BACKEND_URL}${doc}`;
};

const ViewLeaveModal = ({ leave, isOpen, toggle, isAdmin = false }) => {
  const [balanceData, setBalanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Log leave data on component mount to check if data is available
  useEffect(() => {
    console.log('Leave Data:', leave);
  }, [leave]);

  // Fetch balance data when modal opens
  useEffect(() => {
    const fetchBalanceData = async () => {
      if (isOpen && leave?.staffId) {
        setLoading(true);
        try {
          const data = await getStaffLeaveDashboard(leave.staffId);
          setBalanceData(data);
          console.log('Balance Data:', data);
        } catch (error) {
          console.error('Error fetching balance data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBalanceData();
    }, [isOpen, leave?.staffId]);

    const LineField = ({ value }) => (
    <div
      style={{
        borderBottom: '1px solid black',
        minWidth: '100%',
        display: 'inline-block',
        height: '20px',
        fontSize: '14px',
        lineHeight: '20px',
      }}
    >
      {value || ''}
    </div>
  );
  

  // Print function using react-to-print
  const printRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'Leave Request Form',
    removeAfterPrint: true,
  });

  /** PRINT STYLES KHAS UNTUK MODAL (inline style) **/
    // Print styles to preserve modal layout in print (force columns, compact, hide modal bg)
    const printStyles = `
      @media print {
        .modal-print-content, .modal-print-content * {
          visibility: visible !important;
          height: 0% !important;
        }
        #printable-content h5.text-primary,
        #printable-content h6.text-primary {
          font-size: 10px !important;  /* saiz ikut kehendak */
          line-height: 0 !important;
        }
           #printable-content h5.text-center {
          font-size: 12px !important; /* asal 12px atau default, kecilkan ikut kehendak */
        }

        #printable-content h6.text-center {
          font-size: 10px !important; /* asal 12px atau default, kecilkan ikut kehendak */
        }
        #printable-content, #printable-content * {
          visibility: visible !important;
          height: 0% !important;
        }
        body > *:not(.modal-print-content):not(#printable-content) {
          display: none !important;
          height: 0% !important;
        }
        .modal {
          position: static !important;
          overflow: visible !important;
          box-shadow: none !important;
          background: none !important;
          width: 100% !important;
          margin: 0 !important;
          top: 0 !important;
          left: 0 !important;
          transform: none !important;
        }
        .modal-dialog {
          max-width: 100% !important;
          margin: 0 !important;
        }
        .modal-content {
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .modal-header, .modal-footer {
          display: none !important;
        }
        .modal-print-content, #printable-content {
          padding: 2px 6px 0px 8px !important;
          margin: 0 !important;
          width: 100% !important;
          background: white !important;
          color: black !important;
          font-size: 14px !important;
          line-height: 0.9 !important;
        }
        .row {
          display: flex !important;
          flex-wrap: wrap !important;
          margin-right: 0 !important;
          margin-left: 0 !important;
        }
        [class^="col-"], [class*=" col-"] {
          box-sizing: border-box !important;
          padding: 0px 6px !important;
        }
        .col-md-6 {
          flex: 0 0 50% !important;
          max-width: 50% !important;
        }
        .col-md-4 {
          flex: 0 0 33.3333% !important;
          max-width: 33.3333% !important;
        }
        .col-md-12 {
          flex: 0 0 100% !important;
          max-width: 100% !important;
        }
        .form-group, .form-label, .form-control, .form-check {
          margin-bottom: 0px !important;
          font-size: 10px !important;
        }
        label {
          font-weight: 400 !important;
          font-size: 10px !important;
        }
        .modal-backdrop, .modal.fade {
          display: none !important;
        }
        .btn, .close {
          display: none !important;
        }
        /* Prevent page breaks inside modal content */
        .modal-print-content, #printable-content, .modal-print-content * {
          page-break-inside: avoid !important;
        }
        html, body {
          height: auto !important;
          /* Remove zoom for natural scaling */
        }
        @page {
          margin: 2mm 8mm 0mm 8mm;
          size: A4 portrait;
        }
      }
    `;

  if (!leave) return <div>Loading...</div>; // Show loading if leave data is not available

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
        <ModalBody>
        {/* Inject print styles only when modal is open */}
        {isOpen && (
          <style>{printStyles}</style>
        )}
        {leave && (
          <div style={{
            border: '2px solid black',
            borderRadius: '4px',
            padding: '10px',
            marginBottom: '15px'
          }}>
            <div className="p-3" ref={printRef} id="printable-content">
              {/* Header of Form */}
              <h5 className="text-center mb-2">BORANG PERMOHONAN CUTI (HR-18)</h5>
              <h6 className="text-center mb-3">MY-SUTERA SDN. BHD. (367254-M)</h6>


              <Row>
                <Col md="2">
                  <FormGroup>
                    <Label><b>Nama:</b></Label>
                  </FormGroup>
                  <FormGroup>
                    <Label><b>Jawatan:</b></Label>
                  </FormGroup>
                  <FormGroup>
                    <Label><b>Seksyen:</b></Label>
                  </FormGroup>
                </Col>
                <Col md="3">
                  <FormGroup>
                    <LineField value={leave.staff_name || '-'} disabled />
                  </FormGroup>
                  <FormGroup>
                    <LineField value={leave.staff_position || '-'} disabled />
                  </FormGroup>
                  <FormGroup>
                    <LineField value={''} disabled />
                  </FormGroup>
                </Col>
                <Col md="3">
                  <FormGroup>
                    <Label><b>No. Pekerja:</b></Label>
                  </FormGroup>
                  <FormGroup>
                    <Label><b>Tarikh permohonan:</b></Label>
                  </FormGroup>
                  <FormGroup>
                    <Label><b>Bahagian:</b></Label>
                  </FormGroup>
                </Col>
                <Col md="3">
                  <FormGroup>
                    <LineField value={leave.staffId || leave.staff_id || '-'} disabled />
                  </FormGroup>
                  <FormGroup>
                    <LineField value={leave.request_date || leave.created_at || '-'} disabled />
                  </FormGroup>
                  <FormGroup>
                    <LineField value={leave.staff_department || '-'} disabled />
                  </FormGroup>
                </Col>
              </Row>

              {/* Jenis Cuti Section */}
              <Row>
                <Col md="6">
                  <div>
                    <Label><b>Jenis cuti:</b> 
                    <br />
                    (Sila tandakan pada kotak berkenaan)</Label>
                    <div className="mt-2" style={{fontSize:'12px'}}>
                      {(() => {
                        const selectedType = (leave.leave_type || '').toLowerCase();
                        const types = [
                          { key: 'annual', label: 'Cuti tahunan' , match: ['annual', 'tahunan'] },
                          { key: 'unpaid', label: 'Cuti tanpa gaji', match: ['unpaid', 'tanpa gaji'] },
                          { key: 'emergency', label: 'Cuti sakit', match: ['sick', 'mc', 'sakit'] },
                          { key: 'compassionate', label: 'Cuti ehsan', match: ['emergency', 'kecemasan', 'compassionate', 'ehsan'] },
                        ];

                        const isChecked = (matches) => matches.some(m => selectedType.includes(m));

                        return types.map(t => (
                          <div key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <div style={{ width: 16, height: 16, border: '2px solid #333', display: 'inline-block', textAlign: 'center', lineHeight: '14px', fontSize: 12 }}>
                              {isChecked(t.match) ? '✓' : ''}
                            </div>
                            <span>{t.label}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Label><b>Sebab cuti:</b></Label>
                    <LineField value={leave.reason || '-'} disabled />
                  </FormGroup>
                </Col>
              </Row>

              {/* Leave Period Section */}
              <Row>
                <Col md="2">
                  <FormGroup>
                    <Label><b>Bilangan cuti diambil:</b></Label>
                  </FormGroup>
                </Col>
                <Col md="2">
                  <FormGroup>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <LineField
                        value={leave.total_days != null ? String(leave.total_days) : (leave.is_half_day ? '0.5' : '-')} 
                        disabled 
                        style={{ width: '20px', display: 'inline-block' }}
                      />
                      <span>hari</span>
                    </div>
                  </FormGroup>
                </Col>
                <Col md="1">
                  <FormGroup>
                    <Label><b>Dari:</b></Label>
                  </FormGroup>
                </Col>
                <Col md="2">
                  <FormGroup>
                    <LineField  fontSize='10px' value={leave.start_date || '-'} disabled />
                  </FormGroup>
                </Col>
                <Col md="1">
                  <FormGroup>
                    <Label><b>hingga</b></Label>
                  </FormGroup>
                </Col>
                <Col md="2">
                  <FormGroup>
                    <LineField value={leave.end_date || '-'} disabled />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md="6">
                  <FormGroup>
                    <Label><b>Tugas harian saya akan dijalankan oleh:</b></Label>
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <LineField value={leave.job_taken_over_by || '-'} disabled />
                  </FormGroup>
                </Col>
              </Row>
              {/* Signature Section - 3 columns */}
              <Row>
                <Col md="4">
                  <FormGroup>
                    <Label><b>T/tangan Pemohon:</b></Label>
                    <LineField value={''} disabled style={{ height: '40px' }} />
                    <Label><b>Tarikh:</b></Label>
                  </FormGroup>
                </Col>
                <Col md="4">
                  <FormGroup>
                    <Label><b>Disokong / Tidak Sokong</b></Label>
                    <LineField value={''} disabled style={{ height: '40px' }} />
                    <Label><b>T/tangan Ketua Seksyen</b></Label>
                    <Label><b>Tarikh:</b></Label>
                  </FormGroup>
                </Col>
                <Col md="4">
                  <FormGroup>
                    <Label><b>Diluluskan / Tidak Lulus</b></Label>
                    <LineField value={''} disabled style={{ height: '40px' }} />
                    <Label><b>T/tangan Ketua Bahagian / Ketua Pegawai Eksekutif</b></Label>
                    <Label><b>Tarikh:</b></Label>
                  </FormGroup>
                </Col>
              </Row>

              <div style={{ borderTop: '2px solid black', paddingTop: '10px', marginTop: '20px', marginLeft: '-28px', marginRight: '-28px' }}
              ></div>
              <Label><b>Untuk pengesahan jabatan sumber manusia & pentadbiran:</b></Label>
              {loading ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  <p className="mt-2">Loading balance data...</p>
                </div>
              ) : (
                <>
                    <Row>
                      <Col md="6">
                        <FormGroup>
                          <Label><b>Baki cuti tahun lepas:</b></Label>
                        </FormGroup>
                      </Col>
                      <Col md="2">
                        <FormGroup>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign:'center' }}>
                            <LineField value={balanceData?.carry_forward_days || '-'} disabled style={{ width: '80px' }} />
                            <span>hari</span>
                          </div>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col md="6">
                        <FormGroup>
                          <Label><b>Kelayakan cuti tahun semasa:</b></Label>
                        </FormGroup>
                      </Col>
                      <Col md="2">
                        <FormGroup>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign:'center' }}>
                            <LineField value={balanceData?.leave_entitled || '-'} disabled style={{ width: '80px' }} />
                            <span>hari</span>
                          </div>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col md="6">
                        <FormGroup>
                          <Label><b>Jumlah kelayakan:</b></Label>
                        </FormGroup>
                      </Col>
                      <Col md="2">
                        <FormGroup>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign:'center' }}>
                            <LineField value={balanceData?.total_entitlement || '-'} disabled style={{ width: '80px' }} />
                            <span>hari</span>
                          </div>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col md="6">
                        <FormGroup>
                          <Label><b>Cuti telah diambil:</b></Label>
                        </FormGroup>
                      </Col>
                      <Col md="2">
                        <FormGroup>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign:'center' }}>
                            <LineField value={balanceData?.used_days || '-'} disabled style={{ width: '80px' }} />
                            <span>hari</span>
                          </div>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col md="6">
                        <FormGroup>
                          <Label><b>Baki semasa:</b></Label>
                        </FormGroup>
                      </Col>
                      <Col md="2">
                        <FormGroup>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign:'center' }}>
                            <LineField value={balanceData?.current_balance || '-'} disabled style={{ width: '80px' }} />
                            <span>hari</span>
                          </div>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col md="6">
                        <FormGroup>
                          <Label><b>Cuti dipohon:</b></Label>
                        </FormGroup>
                      </Col>
                      <Col md="2">
                        <FormGroup>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign:'center' }}>
                            <LineField value={leave.total_days != null ? String(leave.total_days) : '-'} disabled style={{ width: '80px' }} />
                            <span>hari</span>
                          </div>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col md="6">
                        <FormGroup>
                          <Label><b>Baki cuti:</b></Label>
                        </FormGroup>
                      </Col>
                      <Col md="2">
                        <FormGroup>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign:'center' }}>
                            <LineField value={balanceData?.total_balance || '-'} disabled style={{ width: '80px' }} />
                            <span>hari</span>
                          </div>
                        </FormGroup>
                      </Col>
                    </Row>
                </>
              )}
              <Row className="align-items-start" style={{ marginBottom: '10px' }}>
                <Col md="3">
                  <FormGroup style={{marginBottom: '0px'}}>
                    <Label style={{marginTop:'25px'}}><b>Disemak / Rekod oleh:</b></Label>
                  </FormGroup>
                </Col>

                <Col md="3">
                  <FormGroup style={{marginBottom:'0px'}}>
                    <LineField value={''} disabled />
                  </FormGroup>
                </Col>

                <Col md="3" style={{paddingRight:'0px'}}>
                  <div style={{
                    borderTop: '2px solid black',
                    borderLeft: '2px solid black',
                    height: '100px',
                    display: 'flex',
                    marginRight: '-95px',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    textAlign: 'center'

                  }}> 
                    <FormGroup style={{ marginTop: '5px' }}>
                      <Label><b>COP TARIKH DIPROSES</b></Label>
                    </FormGroup>
                  </div>
                </Col>
              </Row>

              <div
                style={{ 
                  borderTop: '2px solid black',
                  paddingTop: '10px', 
                  marginLeft: '-28px',
                  marginRight: '-28px'
                }} ></div>
                  <Col md="12">
                    <div>
                      <Label><b>Nota:</b></Label>
                      <ul style={{ fontSize: '12px', marginTop: '5px', padding: '0 15px' }}>
                        <li>Permohonan cuti hendaklah dipohon sekurang-kurangnya 4 hari sebelum cuti kecuali ada kecemasan.</li>
                        <li>Kelayakan cuti kecemasan hanya satu hari kecuali yang melibatkan perjalanan keluar daerah.</li>
                      </ul>
                    </div>
                  </Col>
            </div>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <button className="btn btn-secondary" onClick={toggle}>Close</button>
        <button className="btn btn-primary" onClick={handlePrint}>Print</button>
      </ModalFooter>
    </Modal>
  );
};

export default ViewLeaveModal;
