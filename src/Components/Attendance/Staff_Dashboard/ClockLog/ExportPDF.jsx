import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const exportClockLogsToPDF = (logs, staffName, selectedMonth) => {
  if (!selectedMonth) {
    alert("Please select a month to export.");
    return;
  }

  const [year, month] = selectedMonth.split("-");
  const monthInt = parseInt(month, 10);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthYearLabel = `${monthNames[monthInt - 1]} ${year}`;
  const title = `Report for ${staffName}`;

  // Generate all days in the selected month
  const startDate = new Date(year, monthInt - 1, 1);
  const endDate = new Date(year, monthInt, 0);

  const allDates = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    allDates.push(new Date(d));
  }

  // Format merged logs
  const mergedLogs = allDates.map(date => {
    const msiaDateStr = date.toLocaleDateString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' });

    const matchedLog = logs.find(log => {
      const logMsiaDateStr = new Date(log.clock_in).toLocaleDateString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' });
      return logMsiaDateStr === msiaDateStr;
    });

    return {
      Date: msiaDateStr,
      "Clock In": matchedLog
        ? new Date(matchedLog.clock_in).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kuala_Lumpur' })
        : "N/A",
      "Clock Out": matchedLog && matchedLog.clock_out
        ? new Date(matchedLog.clock_out).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kuala_Lumpur' })
        : "N/A",
      "Location Name": matchedLog?.location?.name || "N/A",
      "Location Address": (matchedLog?.location?.address || "N/A").replace(/\n/g, ', ').replace(/\r/g, ''),
      Status: matchedLog?.status || (matchedLog ? "On Time" : "N/A"),
      Notes: matchedLog?.notes || "N/A"
    };
  });

  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 20);

  // Subtitle (month + year)
  doc.setFontSize(12);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100);
  doc.text(monthYearLabel, 14, 28);

  // Horizontal line
  doc.setDrawColor(22, 160, 133); // teal color
  doc.setLineWidth(0.8);
  doc.line(14, 32, 196, 32);

  // Reset font and color for table
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");

  // Table columns and rows
  const columns = ["Date", "Clock In", "Clock Out", "Location Name", "Location Address", "Status","Notes"];
  const rows = mergedLogs.map(log => columns.map(col => log[col]));

  autoTable(doc, {
    startY: 38,
    head: [columns],
    body: rows,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [22, 160, 133] }, // teal header color
    alternateRowStyles: { fillColor: [238, 238, 238] }, // light grey rows
    margin: { left: 14, right: 14 },
    columnStyles: {
      0: { cellWidth: 22 }, // Date
      1: { cellWidth: 18 }, // Clock In
      2: { cellWidth: 20 }, // Clock Out
      3: { cellWidth: 28 }, // Location Name
      4: { cellWidth: 60, cellPadding: 2 }, // Location Address
      5: { cellWidth: 18 }, // Status
      6: { cellWidth: 22 }, // Notes
    },
    // Add watermark text at bottom center on every page
    didDrawPage: (data) => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const watermarkText = "Time Force By Infinicore Sdn Bhd";

      doc.setFontSize(10);
      doc.setTextColor(150); // Light gray color
      doc.setFont("helvetica", "italic");

      // Calculate center position horizontally
      const textWidth = doc.getTextWidth(watermarkText);
      const x = (pageWidth - textWidth) / 2;

      // Position 10mm above bottom edge
      const y = pageHeight - 10;

      doc.text(watermarkText, x, y);
      
      // Reset font color and style if needed
      doc.setTextColor(0);
      doc.setFont("helvetica", "normal");
    }
  });

  const fileName = `${staffName.replace(/\s+/g, "_")}_clock_logs_${selectedMonth}.pdf`;
  doc.save(fileName);
};
