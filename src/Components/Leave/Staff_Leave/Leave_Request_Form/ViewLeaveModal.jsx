import React, { useEffect, useState, useRef } from 'react';
import { Modal, ModalBody, ModalFooter, Row, Col, FormGroup, Label, Input } from 'reactstrap';
import { getStaffLeaveDashboard } from '../../../Attendance/utils';
import { useReactToPrint } from 'react-to-print';
import { FaLanguage } from 'react-icons/fa';


const BACKEND_URL = 'http://127.0.0.1:8000';

// Translation object for multilingual support
const translations = {
  en: {
    title: 'LEAVE APPLICATION FORM (HR-18)',
    company: 'MY-SUTERA SDN. BHD. (367254-M)',
    name: 'Name',
    position: 'Position',
    section: 'Section',
    staffId: 'Staff No.',
    applicationDate: 'Application Date',
    department: 'Department',
    leaveType: 'Leave Type:',
    leaveTypeNote: '(Please mark the relevant box)',
    reason: 'Reason for leave:',
    totalDays: 'Number of days taken:',
    days: 'days',
    from: 'From',
    to: 'to',
    jobTakeover: 'My daily duties will be carried out by',
    applicantSignature: 'Applicant Signature:',
    date: 'Date:',
    supported: 'Supported / Not Supported',
    approved: 'Approved / Not Approved',
    sectionHeadSignature: 'Signature of Section Head',
    divisionHeadSignature: 'Signature of Division Head / Chief Executive Officer',
    hrConfirmation: 'For human resources & administration department confirmation:',
    lastYearBalance: 'Last year leave balance:',
    thisYearBalance: 'This year leave balance:',
    totalBalance: 'Total balance:',
    leaveTaken: 'Leave taken:',
    currentBalance: 'Current balance:',
    leaveApplied: 'Leave applied:',
    leaveBalance: 'Leave balance:',
    reviewedBy: 'Reviewed / Recorded by:',
    stamp: 'DATE PROCESSED STAMP',
    notes: 'Notes:',
    note1: 'Leave applications must be submitted at least 4 days before leave except in emergencies.',
    note2: 'Emergency leave qualification is only one day unless it involves travel outside the district.',
    copies: 'Copies:',
    whiteCopy: 'White for company',
    blueCopy: 'Blue for applicant',
    leaveTypes: {
      annual: 'Annual Leave',
      unpaid: 'Unpaid Leave',
      sick: 'Sick Leave',
      emergency: 'Emergency Leave'
    }
  },
  ms: {
    title: 'BORANG PERMOHONAN CUTI (HR-18)',
    company: 'MY-SUTERA SDN. BHD. (367254-M)',
    name: 'Nama',
    position: 'Jawatan',
    section: 'Seksyen',
    staffId: 'No. Pekerja',
    applicationDate: 'Tarikh permohonan',
    department: 'Bahagian',
    leaveType: 'Jenis cuti:',
    leaveTypeNote: '(Sila tandakan pada kotak berkenaan)',
    reason: 'Sebab cuti:',
    totalDays: 'Bilangan cuti diambil:',
    days: 'hari',
    from: 'Dari',
    to: 'hingga',
    jobTakeover: 'Tugas harian saya akan dijalankan oleh',
    applicantSignature: 'T/tangan Pemohon:',
    date: 'Tarikh:',
    supported: 'Disokong / Tidak Sokong',
    approved: 'Diluluskan / Tidak Lulus',
    sectionHeadSignature: 'T/tangan Ketua Seksyen',
    divisionHeadSignature: 'T/tangan Ketua Bahagian / Ketua Pegawai Eksekutif',
    hrConfirmation: 'Untuk pengesahan jabatan sumber manusia & pentadbiran:',
    lastYearBalance: 'Baki cuti tahun lepas:',
    thisYearBalance: 'Baki cuti tahun ini:',
    totalBalance: 'Jumlah baki:',
    leaveTaken: 'Cuti telah diambil:',
    currentBalance: 'Baki semasa:',
    leaveApplied: 'Cuti dipohon:',
    leaveBalance: 'Baki cuti:',
    reviewedBy: 'Disemak / Rekod oleh:',
    stamp: 'COP TARIKH DIPROSES',
    notes: 'Nota:',
    note1: 'Permohonan cuti hendaklah dipohon sekurang-kurangnya 4 hari sebelum cuti kecuali ada kecemasan.',
    note2: 'Kelayakan cuti kecemasan hanya satu hari kecuali yang melibatkan perjalanan keluar daerah.',
    copies: 'Salinan:',
    whiteCopy: 'Putih untuk syarikat',
    blueCopy: 'Biru untuk pemohon',
    leaveTypes: {
      annual: 'Cuti tahunan',
      unpaid: 'Cuti tanpa gaji',
      sick: 'Cuti sakit',
      emergency: 'Cuti ehsan'
    }
  }
};

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
  const [language, setLanguage] = useState('ms'); // Default to Malay since it's the original language
  
  // Get current translation
  const t = translations[language];

  // Toggle language function
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ms' : 'en');
  };
  
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

    const LineField = ({ value, multiline = false }) => (
    <div
      style={{
        borderBottom: '1px solid black',
        minWidth: '100%',
        display: 'inline-block',
        height: multiline ? 'auto' : '20px',
        minHeight: multiline ? '20px' : '20px',
        fontSize: '14px',
        lineHeight: '20px',
        wordWrap: 'break-word',
        wordBreak: 'break-word',
        whiteSpace: multiline ? 'normal' : 'nowrap',
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
    removeAfterPrint: false,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          box-sizing: border-box !important;
        }
        html, body {
          width: 210mm !important;
          height: 297mm !important;
          margin: 0 !important;
          padding: 0 !important;
          font-family: Arial, sans-serif !important;
          overflow: hidden !important;
        }
        #printable-content {
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
          height: auto !important;
          padding: 12px !important;
          margin: 0 auto !important;
          border: 2px solid black !important;
          box-sizing: border-box !important;
          font-family: Arial, sans-serif !important;
          font-size: 11px !important;
          transform: scale(0.95) !important;
          transform-origin: top center !important;
        }
        .modal-body, .modal-content {
          box-shadow: none !important;
          border: none !important;
        }
        .row {
          display: flex !important;
          flex-wrap: wrap !important;
          margin-right: -15px !important;
          margin-left: -15px !important;
        }
        [class^="col-"], [class*=" col-"] {
          position: relative !important;
          padding-right: 15px !important;
          padding-left: 15px !important;
          box-sizing: border-box !important;
        }
        .col-md-3 { flex: 0 0 25% !important; max-width: 25% !important; }
        .col-md-4 { flex: 0 0 33.333333% !important; max-width: 33.333333% !important; }
        .col-md-5 { flex: 0 0 41.666667% !important; max-width: 41.666667% !important; }
        .col-md-6 { flex: 0 0 50% !important; max-width: 50% !important; }
        .col-md-12 { flex: 0 0 100% !important; max-width: 100% !important; }
        .btn, .close, .modal-header, .modal-footer {
          display: none !important;
        }
        .form-group {
          margin-bottom: 0 !important;
        }
        h4 {
          font-size: 16px !important;
          margin: 0 !important;
          font-weight: bold !important;
        }
        h5 {
          font-size: 13px !important;
          margin: 0 !important;
          font-weight: bold !important;
        }
        /* Slightly reduce spacing for print */
        div[style*="marginBottom: '40px'"] {
          margin-bottom: 30px !important;
        }
        div[style*="marginBottom: '30px'"] {
          margin-bottom: 25px !important;
        }
        div[style*="marginBottom: '25px'"] {
          margin-bottom: 20px !important;
        }
        div[style*="marginBottom: '20px'"] {
          margin-bottom: 15px !important;
        }
        div[style*="marginBottom: '15px'"] {
          margin-bottom: 12px !important;
        }
        /* Preserve flex layouts */
        div[style*="display: flex"] {
          display: flex !important;
        }
        /* Preserve borders */
        div[style*="border"],
        div[style*="borderTop"],
        div[style*="borderBottom"],
        div[style*="borderLeft"],
        div[style*="borderRight"] {
          border-color: black !important;
        }
        /* Fix negative margins for print - keep borders inside */
        .print-no-negative-margin {
          margin-left: 0.5 !important;
          margin-right: 0.5 !important;
          padding-left: 30px !important;
          padding-right: 15px !important;
        }
        .print-no-negative-margin > .row {
          margin-left: 0 !important;
          margin-right: 0 !important;
        }
        .print-no-negative-margin > .row > [class*="col-"] {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        .print-no-negative-margin div[style*="paddingLeft: '28px'"],
        .print-no-negative-margin div[style*="paddingRight: '28px'"] {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        /* Prevent page breaks inside important sections */
        .row, [class*="col-"] {
          page-break-inside: avoid !important;
        }
      }
    `,
  });

  if (!leave) return <div>Loading...</div>; // Show loading if leave data is not available

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
        <div className="modal-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="modal-title mb-0">View Leave Application</h5>
          <div className="d-flex align-items-center">
            <button
              type="button"
              className="btn btn-outline-light btn-sm me-2"
              onClick={toggleLanguage}
              title={language === 'en' ? 'Switch to Bahasa Malaysia' : 'Switch to English'}
            >
              <FaLanguage className="me-1" />
              {language === 'en' ? 'BM' : 'EN'}
            </button>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={toggle}
            ></button>
          </div>
        </div>
        <ModalBody>
        {/* Inject print styles only when modal is open */}
        {leave && (
          <div style={{
            border: '2px solid black',
            borderRadius: '4px',
            padding: '10px',
            marginBottom: '15px'
          }}>
            <div className="p-3" ref={printRef} id="printable-content" style={{
              padding: '15px',
              backgroundColor: 'white',
              fontFamily: 'Arial, sans-serif'
            }}>
              {/* Header of Form */}
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h4 style={{ 
                  margin: '0 0 5px 0', 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  letterSpacing: '0.5px'
                }}>
                  {t.title}
                </h4>
                <h5 style={{ 
                  margin: '0', 
                  fontSize: '14px', 
                  fontWeight: 'bold',
                  letterSpacing: '0.3px'
                }}>
                  {t.company}
                </h5>
              </div>


              {/* Applicant Details Section */}
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                  {/* Left Column */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold', width: '70px', flexShrink: 0, fontSize: '14px' }}>{t.name}</span>
                      <span style={{ margin: '0 3px' }}>:</span>
                      <div style={{ 
                        borderBottom: '1px solid black', 
                        width: '180px',
                        minHeight: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '5px',
                        fontSize: '14px'
                      }}>
                        {leave.staff_name || ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold', width: '70px', flexShrink: 0, fontSize: '14px' }}>{t.position}</span>
                      <span style={{ margin: '0 3px' }}>:</span>
                      <div style={{ 
                        borderBottom: '1px solid black', 
                        width: '180px',
                        minHeight: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '5px',
                        fontSize: '14px'
                      }}>
                        {leave.staff_position || ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold', width: '70px', flexShrink: 0, fontSize: '14px' }}>{t.section}</span>
                      <span style={{ margin: '0 3px' }}>:</span>
                      <div style={{ 
                        borderBottom: '1px solid black', 
                        width: '180px',
                        minHeight: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '5px',
                        fontSize: '14px'
                      }}>
                        {''}
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold', width: '140px', flexShrink: 0, fontSize: '14px', whiteSpace: 'nowrap' }}>{t.staffId}</span>
                      <span style={{ margin: '0 3px' }}>:</span>
                      <div style={{ 
                        borderBottom: '1px solid black', 
                        width: '200px',
                        minHeight: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '5px',
                        fontSize: '14px'
                      }}>
                        {leave.staffId || leave.staff_id || ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold', width: '140px', flexShrink: 0, fontSize: '14px', whiteSpace: 'nowrap' }}>{t.applicationDate}</span>
                      <span style={{ margin: '0 3px' }}>:</span>
                      <div style={{ 
                        borderBottom: '1px solid black', 
                        width: '200px',
                        minHeight: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '5px',
                        fontSize: '14px'
                      }}>
                        {leave.request_date || leave.created_at || ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold', width: '140px', flexShrink: 0, fontSize: '14px' }}>{t.department}</span>
                      <span style={{ margin: '0 3px' }}>:</span>
                      <div style={{ 
                        borderBottom: '1px solid black', 
                        width: '200px',
                        minHeight: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '5px',
                        fontSize: '14px'
                      }}>
                        {leave.staff_department || ''}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leave Type and Reason Section */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                  {/* Left Column - Leave Type */}
                  <div style={{ flex: 1, maxWidth: '50%' }}>
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>
                        {t.leaveType}
                      </div>
                      <div style={{ fontSize: '11px', marginBottom: '8px' }}>
                        {t.leaveTypeNote}
                      </div>
                      <div style={{ fontSize: '12px' }}>
                      {(() => {
                        const selectedType = (leave.leave_type || '').toLowerCase();
                        const types = [
                            { key: 'annual', label: t.leaveTypes.annual, match: ['annual', 'tahunan'] },
                          { key: 'unpaid', label: t.leaveTypes.unpaid, match: ['unpaid', 'tanpa gaji'] },
                          { key: 'emergency', label: t.leaveTypes.sick, match: ['sick', 'mc', 'sakit'] },
                          { key: 'compassionate', label: t.leaveTypes.emergency, match: ['emergency', 'kecemasan', 'compassionate', 'ehsan'] },
                        ];

                        const isChecked = (matches) => matches.some(m => selectedType.includes(m));

                        return types.map(type => (
                            <div key={type.key} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              marginBottom: '6px',
                              gap: '8px'
                            }}>
                              <div style={{ 
                                width: '14px', 
                                height: '14px', 
                                border: '2px solid #333', 
                                display: 'inline-block', 
                                textAlign: 'center', 
                                lineHeight: '10px', 
                                fontSize: '10px',
                                flexShrink: 0
                              }}>
                              {isChecked(type.match) ? '✓' : ''}
                            </div>
                              <span style={{ fontSize: '12px' }}>{type.label}</span>
                          </div>
                        ));
                      })()}
                    </div>
                    </div>
                  </div>
                  
                  {/* Right Column - Reason */}
                  <div style={{ flex: 1, maxWidth: '50%' }}>
                    <div style={{ marginBottom: 0 }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>{t.reason}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                        {(() => {
                          const reason = leave.reason || '-';
                          const maxCharsPerLine = 40; // Characters per line
                          const lines = [];
                          
                          if (reason === '-') {
                            lines.push('-');
                          } else {
                            // Split reason into words
                            const words = reason.split(' ');
                            let currentLine = '';
                            
                            words.forEach((word, index) => {
                              const testLine = currentLine ? `${currentLine} ${word}` : word;
                              
                              if (testLine.length <= maxCharsPerLine) {
                                currentLine = testLine;
                              } else {
                                if (currentLine) {
                                  lines.push(currentLine);
                                }
                                currentLine = word;
                              }
                              
                              // Push the last line
                              if (index === words.length - 1 && currentLine) {
                                lines.push(currentLine);
                              }
                            });
                          }
                          
                          // Ensure we always have 4 lines for consistent form appearance
                          while (lines.length < 4) {
                            lines.push('');
                          }
                          
                          return lines.slice(0, 4).map((line, idx) => (
                            <LineField key={idx} value={line} />
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leave Duration Section */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px', gap: '5px' }}>
                  <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>{t.totalDays}</span>
                  <div style={{ 
                    borderBottom: '1px solid black', 
                    width: '35px',
                    minHeight: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '5px'
                  }}>
                    {leave.total_days != null ? String(leave.total_days) : (leave.is_half_day ? '0.5' : '')}
                  </div>
                  <span style={{ marginLeft: '3px', whiteSpace: 'nowrap' }}>{t.days}</span>
                  <span style={{ fontWeight: 'bold', marginLeft: '15px', whiteSpace: 'nowrap' }}>{t.from}:</span>
                  <div style={{ 
                    borderBottom: '1px solid black', 
                    width: '110px',
                    minHeight: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '5px'
                  }}>
                    {leave.start_date || ''}
                  </div>
                  <span style={{ fontWeight: 'bold', marginLeft: '15px', whiteSpace: 'nowrap' }}>{t.to}</span>
                  <div style={{ 
                    borderBottom: '1px solid black', 
                    width: '110px',
                    minHeight: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '5px'
                  }}>
                    {leave.end_date || ''}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', marginRight: '5px' }}>{t.jobTakeover}:</span>
                  <div style={{ 
                    borderBottom: '1px solid black', 
                    flex: 1,
                    minHeight: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '5px'
                  }}>
                    {leave.job_taken_over_by || ''}
                  </div>
                </div>
              </div>
              {/* Signature Section */}
              <div style={{ marginBottom: '15px' }}>
              <Row>
                <Col md="4">
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '30px', textAlign: 'center' }}>
                        {t.applicantSignature}
                      </div>
                      <div style={{ 
                        borderBottom: '1px solid black', 
                        height: '35px',
                        marginBottom: '8px'
                      }}></div>
                      <div style={{ fontWeight: 'bold', textAlign: 'left' }}>{t.date}</div>
                    </div>
                </Col>
                <Col md="4">
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '30px', textAlign: 'center' }}>
                        {t.supported}
                      </div>
                      <div style={{ 
                        borderBottom: '1px solid black', 
                        height: '35px',
                        marginBottom: '8px'
                      }}></div>
                      <div style={{ fontWeight: 'bold', marginBottom: '3px', textAlign: 'left' }}>
                        {t.sectionHeadSignature}
                      </div>
                      <div style={{ fontWeight: 'bold', textAlign: 'left' }}>{t.date}</div>
                    </div>
                </Col>
                <Col md="4">
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '30px', textAlign: 'center' }}>
                        {t.approved}
                      </div>
                      <div style={{ 
                        borderBottom: '1px solid black', 
                        height: '35px',
                        marginBottom: '8px'
                      }}></div>
                      <div style={{ fontWeight: 'bold', marginBottom: '3px', textAlign: 'left' }}>
                        {t.divisionHeadSignature}
                      </div>
                      <div style={{ fontWeight: 'bold', textAlign: 'left' }}>{t.date}</div>
                    </div>
                </Col>
              </Row>
              </div>

              {/* HR Confirmation Section */}
              <div className="print-no-negative-margin" style={{ 
                borderTop: '2px solid black', 
                paddingTop: '15px', 
                marginTop: '0px',
                marginBottom: '20px',
                marginLeft: '-25px',
                marginRight: '-25px',
                paddingLeft: '25px',
                paddingRight: '25px'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '15px' }}>
                  {t.hrConfirmation}
                </div>
              {loading ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  <p className="mt-2">Loading balance data...</p>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '10px', paddingLeft: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold', minWidth: '320px' }}>{t.lastYearBalance}</span>
                      <div style={{ 
                        borderBottom: '1px solid black', 
                        width: '60px',
                        minHeight: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '5px'
                      }}>
                        {balanceData?.carry_forward_days || ''}
                      </div>
                      <span style={{ marginLeft: '5px' }}>{t.days}</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold', minWidth: '320px' }}>{t.thisYearBalance}</span>
                      <div style={{ 
                        borderBottom: '1px solid black', 
                        width: '60px',
                        minHeight: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '5px'
                      }}>
                        {balanceData?.leave_entitled || ''}
                      </div>
                      <span style={{ marginLeft: '5px' }}>{t.days}</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold', minWidth: '320px' }}>{t.totalBalance}</span>
                      <div style={{ 
                        borderBottom: '1px solid black', 
                        width: '60px',
                        minHeight: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '5px'
                      }}>
                        {balanceData?.total_entitlement || ''}
                      </div>
                      <span style={{ marginLeft: '5px' }}>{t.days}</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold', minWidth: '320px' }}>{t.leaveTaken}</span>
                      <div style={{ 
                        borderBottom: '1px solid black', 
                        width: '60px',
                        minHeight: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '5px'
                      }}>
                        {balanceData?.used_days || ''}
                      </div>
                      <span style={{ marginLeft: '5px' }}>{t.days}</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold', minWidth: '320px' }}>{t.currentBalance}</span>
                      <div style={{ 
                        borderBottom: '1px solid black', 
                        width: '60px',
                        minHeight: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '5px'
                      }}>
                        {balanceData?.current_balance || ''}
                          </div>
                      <span style={{ marginLeft: '5px' }}>{t.days}</span>
                          </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold', minWidth: '320px' }}>{t.leaveApplied}</span>
                      <div style={{ 
                        borderBottom: '1px solid black', 
                        width: '60px',
                        minHeight: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '5px'
                      }}>
                        {leave.total_days != null ? String(leave.total_days) : ''}
                          </div>
                      <span style={{ marginLeft: '5px' }}>{t.days}</span>
                          </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold', minWidth: '320px' }}>{t.leaveBalance}</span>
                      <div style={{ 
                        borderBottom: '1px solid black', 
                        width: '60px',
                        minHeight: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: '5px'
                      }}>
                        {balanceData?.total_balance || ''}
                          </div>
                      <span style={{ marginLeft: '5px' }}>{t.days}</span>
                          </div>
                          </div>
                </>
              )}
              </div>

              <Row className="align-items-end" style={{ marginBottom: '10px' }}>
                <Col
                  md="3"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                    paddingRight: '0px',
                  }}
                >
                  <FormGroup style={{ marginBottom: '0' }}>
                    <Label style={{ marginTop: '10px', marginBottom: '0' }}>
                      <b>{t.reviewedBy}</b>
                    </Label>
                  </FormGroup>
                </Col>
                <Col
                  md="5"
                  style={{
                    paddingLeft: '0px',
                    marginLeft: '5px',
                  }}
                >
                  <FormGroup style={{ marginBottom: '0' }}>
                    <LineField value={''} disabled />
                  </FormGroup>
                </Col>

                <Col md="3">
                  <div
                    style={{
                      borderTop: '2px solid black',
                      borderLeft: '2px solid black',
                      height: '100px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'flex-start',
                      textAlign: 'center',
                      marginRight: '-85px', 
                      marginTop: '20px',
                      marginBottom: '-10px',
                    }}
                  >
                    <FormGroup style={{ marginTop: '5px', marginBottom: 0 }}>
                      <Label>
                        <b>{t.stamp}</b>
                      </Label>
                    </FormGroup>
                  </div>
                </Col>
              </Row>

              <div
                className="print-no-negative-margin"
                style={{ 
                  borderTop: '2px solid black',
                  paddingTop: '10px', 
                  marginLeft: '-28px',
                  marginRight: '-28px'
                }} >
                <Row>
                  <Col md="12">
                    <div style={{ paddingLeft: '28px', paddingRight: '28px' }}>
                      <Label><b>{t.notes}</b></Label>
                      <ul style={{ fontSize: '12px', marginTop: '5px', padding: '0 15px' }}>
                        <li>{t.note1}</li>
                        <li>{t.note2}</li>
                      </ul>
                    </div>
                  </Col>
                </Row>
              </div>
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