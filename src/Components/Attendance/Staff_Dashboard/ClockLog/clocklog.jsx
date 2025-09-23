import React, { useEffect, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Card, CardHeader, Col } from 'reactstrap';
import { getClockLogs } from '../../utils';
import { exportClockLogsToPDF } from './ExportPDF';
import { FaFilePdf } from 'react-icons/fa';
import Loader from '../../Loader' 

const ClockLogPage = () => {
  const staffId = sessionStorage.getItem('staffId');
  const numericStaffId = Number(staffId);
  const navigate = useNavigate();

  useEffect(() => {
    if (!staffId) {
      navigate('/login');
    }
  }, [staffId, navigate]);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      const start = Date.now();
      try {
        const data = await getClockLogs(numericStaffId);
        setLogs(data || []);
      } catch (error) {
        console.error('Failed to fetch clock logs:', error);
      } finally {
        const elapsed = Date.now() - start;
        const delay = Math.max(0, 3000 - elapsed); // Minimum 3 seconds delay
        setTimeout(() => setLoading(false), delay);
      }
    };

    fetchLogs();
  }, [numericStaffId]);

  const filteredLogs = logs.filter(log => {
    const logDate = new Date(log.clock_in);
    const logYearMonth = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}`;
    const matchesMonth = selectedMonth ? logYearMonth === selectedMonth : true;

    const search = searchTerm.toLowerCase();
    const matchesSearch =
      !search ||
      log.staff?.name?.toLowerCase().includes(search) ||
      new Date(log.clock_in).toLocaleDateString().includes(search) ||
      new Date(log.clock_in).toLocaleTimeString().includes(search) ||
      new Date(log.clock_out).toLocaleTimeString().includes(search) ||
      log.location?.name?.toLowerCase().includes(search) ||
      log.location?.address?.toLowerCase().includes(search) ||
      log.status?.toLowerCase().includes(search);

    return matchesMonth && matchesSearch;
  });

  const staffName = logs[0]?.staff?.name;

  const columns = [
    {
      name: 'Date',
      selector: row => new Date(row.clock_in).toLocaleDateString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' }),
      sortable: true,
    },
    {
      name: 'Clock In',
      selector: row =>
        new Date(row.clock_in).toLocaleTimeString('en-MY', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'Asia/Kuala_Lumpur',
        }),
    },
    {
      name: 'Clock Out',
      selector: row =>
        row.clock_out
          ? new Date(row.clock_out).toLocaleTimeString('en-MY', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
              timeZone: 'Asia/Kuala_Lumpur',
            })
          : '—',
    },
    {
      name: 'Location',
      cell: row => (
        <div>
          {row.location?.name}
        </div>
      ),
    },
    {
      name: 'Status',
      cell: row => {
        const status = row.status || 'On Time';
        const color = status === 'Late' ? 'text-danger' : 'text-success';
        return (
          <span className={color} style={{ fontWeight: 'bold' }}>
            {status}
          </span>
        );
      },
    },
    {
      name: 'Notes',
      cell: row => <div>{row.notes}</div>,
    },
  ];

  // ✅ Show loader while loading
  if (loading) return <Loader />;

  return (
    <Fragment>
      <style>{`
        @media (max-width: 576px) {
          .rdt_TableCell {
            font-size: 11px;
            white-space: nowrap;
          }

          .filter-container {
            flex-wrap: nowrap !important;
            gap: 6px;
          }

          .filter-container input[type="month"],
          .filter-container input[type="text"] {
            width: 120px;
            min-width: 0;
            flex-shrink: 1;
          }

          .btn-purple-effect {
            white-space: nowrap;
            padding: 8px 12px;
            font-size: 13px;
            flex-shrink: 1;
          }

          .export-btn .btn-text {
            display: none;
          }
        }

        .input-styled {
          padding: 6px 8px;
          border-radius: 4px;
          border: 1px solid #ccc;
          font-size: 13px;
          outline: none;
          transition: box-shadow 0.2s ease;
          color: #555555;
        }

        .input-styled:focus {
          box-shadow: 0 0 0 2px rgba(111, 66, 193, 0.4);
        }

        .btn-purple-effect {
          position: relative;
          background-color: #6f42c1;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-purple-effect:hover {
          background-color: #59309e;
        }

        .rdt_TableCell, .rdt_TableRow {
          color: #555555;
        }
      `}</style>

      <div
        style={{
          padding: '20px',
          fontFamily: 'Arial',
          width: '100%',
          maxWidth: '100%',
          overflowX: 'auto',
          color: '#555555',
        }}
      >
        <Col sm="12">
          <Card>
            <CardHeader>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <span style={{ fontSize: '1.5rem', color: '#555555', fontWeight: 'bold' }}>All clock-in/out records</span>

                <div
                  className="filter-container"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flexWrap: 'wrap',
                  }}
                >
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    className="input-styled"
                    title="Select month to filter"
                  />

                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="input-styled"
                    title="Search anything"
                  />

                  <button
                    onClick={() => exportClockLogsToPDF(filteredLogs, staffName, selectedMonth)}
                    className="btn-purple-effect export-btn"
                    title="Export to PDF"
                  >
                    <FaFilePdf />
                    <span className="btn-text">Export to PDF</span>
                  </button>
                </div>
              </div>
            </CardHeader>

            <DataTable
              columns={columns}
              data={filteredLogs}
              pagination
              striped
              highlightOnHover
              responsive
            />
          </Card>
        </Col>
      </div>
    </Fragment>
  );
};

export default ClockLogPage;
