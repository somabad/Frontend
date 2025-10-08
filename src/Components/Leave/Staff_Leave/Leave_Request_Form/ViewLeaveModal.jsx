import React, { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalFooter, Row, Col, FormGroup, Label, Input } from 'reactstrap';
import { getStaffLeaveDashboard } from '../../../Attendance/utils';

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

  // Print function
  const handlePrint = () => {
    const printContents = document.getElementById('printable-content').innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  if (!leave) return <div>Loading...</div>; // Show loading if leave data is not available

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalBody id="printable-content">
        {leave && (
          <div className="p-3">
            {/* Header of Form */}
            <h5 className="text-center mb-2">BORANG PERMOHONAN CUTI (HR-18)</h5>
            <h6 className="text-center mb-3">MY-SUTERA SDN. BHD.</h6>
            <hr />
            <h5 className="text-primary">Butiran Pemohon</h5>

            {/* Personal and Staff Info Section */}
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label><b>Nama:</b></Label>
                  <Input value={leave.staff_name || '-'} disabled />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label><b>No Pekerja:</b></Label>
                  <Input value={leave.staffId || leave.staff_id || '-'} disabled />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label><b>Jawatan:</b></Label>
                  <Input value={leave.staff_position || '-'} disabled />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label><b>Tarikh Permohonan:</b></Label>
                  <Input value={leave.request_date || leave.created_at || '-'} disabled />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label><b>Bahagian:</b></Label>
                  <Input value={leave.staff_department || '-'} disabled />
                </FormGroup>
              </Col>
            </Row>

            <Row className="mb-2">
              {(() => {
                const selectedType = (leave.leave_type || '').toLowerCase();
                const types = [
                  { key: 'annual', label: 'Cuti tahunan', match: ['annual', 'tahunan'] },
                  { key: 'unpaid', label: 'Cuti tanpa gaji', match: ['unpaid', 'tanpa gaji'] },
                  { key: 'emergency', label: 'Cuti sakit', match: ['sick', 'mc', 'sakit'] },
                  { key: 'compassionate', label: 'Cuti ehsan', match: ['emergency', 'kecemasan', 'compassionate', 'ehsan'] },
                ];

                const isChecked = (matches) => matches.some(m => selectedType.includes(m));

                return types.map(t => (
                  <Col md="3" key={t.key} className="mb-2">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 16, height: 16, border: '1px solid #333', display: 'inline-block', textAlign: 'center', lineHeight: '14px', fontSize: 12 }}>
                        {isChecked(t.match) ? '✓' : ''}
                      </div>
                      <span>{t.label}</span>
                    </div>
                  </Col>
                ));
              })()}

              <Col md="12">
                <FormGroup>
                  <Label><b>Sebab cuti:</b></Label>
                  <Input value={leave.reason || '-'} disabled />
                </FormGroup>
              </Col>
            </Row>

            {/* Leave Period and Reason Section */}
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label><b>Bilangan cuti diambil:</b></Label>
                  <Input value={leave.total_days != null ? String(leave.total_days) : (leave.is_half_day ? '0.5' : '-')} disabled />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label><b>Dari:</b></Label>
                  <Input value={leave.start_date || '-'} disabled />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label><b>Hingga:</b></Label>
                  <Input value={leave.end_date || '-'} disabled />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label><b>Separuh hari:</b></Label>
                  <Input value={leave.is_half_day ? 'Yes' : 'No'} disabled />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="12">
                <FormGroup>
                  <Label><b>Tugas harian saya akan dijalankan oleh:</b></Label>
                  <Input value={leave.job_taken_over_by || '-'} disabled />
                </FormGroup>
              </Col>
            </Row>

            {/* Leave Balance Section (HR panel) */}
            <h5 className="text-primary">Untuk pengesahan (Sumber Manusia & Pentadbiran)</h5>
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
                      <Input value={balanceData?.carry_forward_days || '-'} disabled />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label><b>Kelayakan cuti tahun semasa:</b></Label>
                      <Input value={balanceData?.leave_entitled || '-'} disabled />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label><b>Jumlah kelayakan:</b></Label>
                      <Input value={balanceData?.total_entitlement || '-'} disabled />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label><b>Cuti telah diambil:</b></Label>
                      <Input value={balanceData?.used_days || '-'} disabled />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label><b>Baki semasa:</b></Label>
                      <Input value={balanceData?.current_balance || '-'} disabled />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label><b>Cuti dipohon:</b></Label>
                      <Input value={leave.total_days != null ? String(leave.total_days) : '-'} disabled />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label><b>Baki cuti:</b></Label>
                      <Input value={balanceData?.total_balance || '-'} disabled />
                    </FormGroup>
                  </Col>
                </Row>
              </>
            )}
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label><b>Disemak / Rekod oleh:</b></Label>
                  <Input value={''} disabled />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label><b>Cop Tarikh Diproses</b></Label>
                  <Input value={''} disabled />
                </FormGroup>
              </Col>
            </Row>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <button className="btn btn-secondary" onClick={toggle}>Close</button>
        {isAdmin && (
          <button className="btn btn-primary" onClick={handlePrint}>Print</button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default ViewLeaveModal;
