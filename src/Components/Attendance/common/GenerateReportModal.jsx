import React, { useEffect, useState } from 'react';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  FormGroup, Label, Row, Col, Spinner
} from 'reactstrap';
import { Btn } from '../../../AbstractElements';
import { Close } from '../../../Constant/indexmy';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getStaffLocations, generateClockLogReport } from '../utils';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // ✅ Ensure this import is present

const GenerateReport = ({ isOpen, toggle, user }) => {
  const [assignedLocations, setAssignedLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      setIsLoading(true);
      try {
        const response = await getStaffLocations();
        const matched = response.find((item) => item.staffId === user?.staffId);
        setAssignedLocations(matched?.locations || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setAssignedLocations([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && user?.staffId) {
      fetchLocations();
    }
  }, [isOpen, user]);

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const escapeCSV = (text) => `"${(text || '').replace(/"/g, '""')}"`;

  const getAllDatesInRange = (start, end) => {
    const dates = [];
    const current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const generateReportData = async () => {
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    const reportData = await generateClockLogReport(user.staffId, formattedStartDate, formattedEndDate);

    const reportMap = {};
    reportData.forEach((entry) => {
      const date = formatDate(new Date(entry.clock_in));
      reportMap[date] = {
        ...entry,
        clock_in: entry.clock_in ? new Date(entry.clock_in).toLocaleTimeString() : '',
        clock_out: entry.clock_out ? new Date(entry.clock_out).toLocaleTimeString() : '',
        location: entry.location?.name || '',
      };
    });

    const allDates = getAllDatesInRange(startDate, endDate);

    const reportRows = allDates.map((date) => {
      const formattedDate = formatDate(date);
      const entry = reportMap[formattedDate] || {};
      return {
        date: formattedDate,
        clock_in: entry?.clock_in ?? 'N/A',
        clock_out: entry?.clock_out ?? '',
        start_hour: entry?.location?.start_hour ?? 'N/A',
        end_hour: entry?.location?.end_hour ?? 'N/A',
        diff_in: entry?.time_diff_clock_in ?? 'N/A',
        diff_out: entry?.time_diff_clock_out ?? 'N/A',
        location: typeof entry?.location === 'string' ? entry?.location : entry?.location?.name ?? 'N/A',
        notes: entry?.notes ?? 'N/A',
      };
    });

    return { reportRows, formattedStartDate, formattedEndDate };
  };

  const exportToCSV = async () => {
    if (!startDate || !endDate) {
      Swal.fire({ icon: 'warning', title: 'Incomplete Dates', text: 'Please select both start and end dates.' });
      return;
    }

    try {
      const { reportRows, formattedStartDate, formattedEndDate } = await generateReportData();

      let csvContent = `Name:,${escapeCSV(user?.name)}\n`;
      csvContent += `Role:,${escapeCSV(user?.roleId?.name)}\n`;
      csvContent += `Location Assigned:,${escapeCSV(assignedLocations.map((loc) => loc.location_name).join(', '))}\n`;
      csvContent += `From Date:,${formattedStartDate}\n`;
      csvContent += `To Date:,${formattedEndDate}\n\n`;
      csvContent += `Date,Clock In,Clock Out,Start Hour,End Hour,Time Diff Clock In,Time Diff Clock Out,Location,Notes\n`;

      reportRows.forEach(row => {
        csvContent += [
          escapeCSV(row.date),
          escapeCSV(row.clock_in),
          escapeCSV(row.clock_out),
          escapeCSV(row.start_hour),
          escapeCSV(row.end_hour),
          escapeCSV(row.diff_in),
          escapeCSV(row.diff_out),
          escapeCSV(row.location),
          escapeCSV(row.notes),
        ].join(',') + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Attendance_Report_${user?.name || 'User'}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toggle();
      setTimeout(() => {
        Swal.fire({ icon: 'success', title: 'Report Generated', text: `CSV Report for ${user?.name} generated.` });
      }, 300);
    } catch (error) {
      console.error('CSV error:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to generate CSV report.' });
    }
  };

  const exportToPDF = async () => {
    if (!startDate || !endDate) {
      Swal.fire({ icon: 'warning', title: 'Incomplete Dates', text: 'Please select both start and end dates.' });
      return;
    }

    try {
      const { reportRows, formattedStartDate, formattedEndDate } = await generateReportData();

      const doc = new jsPDF();
      doc.setFontSize(12);
      doc.text(`Attendance Report for ${user?.name}`, 14, 10);
      doc.text(`Role: ${user?.roleId?.name}`, 14, 17);
      doc.text(`Location: ${assignedLocations.map((l) => l.location_name).join(', ')}`, 14, 24);
      doc.text(`Date Range: ${formattedStartDate} - ${formattedEndDate}`, 14, 31);

      const tableData = reportRows.map(row => [
        row.date, row.clock_in, row.clock_out, row.start_hour, row.end_hour,
        row.diff_in, row.diff_out, row.location, row.notes
      ]);

      autoTable(doc, {
        head: [['Date', 'Clock In', 'Clock Out', 'Start Hour', 'End Hour', 'Diff In', 'Diff Out', 'Location', 'Notes']],
        body: tableData,
        startY: 36,
        styles: { fontSize: 8 }
      });

      doc.save(`Attendance_Report_${user?.name}.pdf`);

      toggle();
      setTimeout(() => {
        Swal.fire({ icon: 'success', title: 'Report Generated', text: `PDF Report for ${user?.name} generated.` });
      }, 300);
    } catch (error) {
      console.error('PDF error:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to generate PDF report.' });
    }
  };

  const disableCurrentAndFutureMonths = (date) => {
    const today = new Date();
    const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return date < firstDayOfCurrentMonth;
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle}>User Details</ModalHeader>
      <ModalBody>
        <Row className="mb-2">
          <Col md="6" className="d-flex">
            <Label className="fw-bold me-2">Name:</Label>
            <div>{user?.name || '-'}</div>
          </Col>
        </Row>
        <Row>
          <Col md="6" className="d-flex">
            <Label className="fw-bold me-2">Email:</Label>
            <div>{user?.email || '-'}</div>
          </Col>
        </Row>
        <Row className="mb-2">
          <Col md="6" className="d-flex">
            <Label className="fw-bold me-2">Role:</Label>
            <div>{user?.roleId?.name || '-'}</div>
          </Col>
        </Row>
        <Row>
          <Col md="12" className="d-flex">
            <Label className="fw-bold me-2">Assigned Locations:</Label>
            {isLoading ? (
              <div className="d-flex align-items-center gap-2">
                <Spinner size="sm" color="primary" />
                <span>Loading...</span>
              </div>
            ) : assignedLocations.length ? (
              <div>{assignedLocations.map((loc) => loc.location_name).join(', ')}</div>
            ) : (
              <div className="text-muted">
                This user has not been assigned to any location yet.
              </div>
            )}
          </Col>
        </Row>

        <Row className="mt-4">
          <Col md="6">
            <FormGroup>
              <Label className="fw-bold">Start Date:</Label>
              <DatePicker
                className="form-control"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Select start date"
                isClearable
                filterDate={disableCurrentAndFutureMonths}
              />
            </FormGroup>
          </Col>
          <Col md="6">
            <FormGroup>
              <Label className="fw-bold">End Date:</Label>
              <DatePicker
                className="form-control"
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                placeholderText="Select end date"
                isClearable
                filterDate={disableCurrentAndFutureMonths}
              />
            </FormGroup>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Btn attrBtn={{ color: 'success', onClick: exportToCSV }}>Export to CSV</Btn>
        <Btn attrBtn={{ color: 'danger', onClick: exportToPDF }}>Export to PDF</Btn>
        <Btn attrBtn={{ color: 'secondary', onClick: toggle }}>{Close}</Btn>
      </ModalFooter>
    </Modal>
  );
};

export default GenerateReport;
