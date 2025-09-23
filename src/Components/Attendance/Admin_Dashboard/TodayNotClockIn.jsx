import React, { useState } from 'react';
import {
    Col,
    Card,
    CardHeader,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from 'reactstrap';
import DataTable from 'react-data-table-component';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { FaFileCsv, FaFilePdf, FaChevronDown } from 'react-icons/fa';
import { Phone } from 'react-feather';

const TodayNotClockIn = ({ notClockedInStaff, loading, error }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const toggleDropdown = () => setDropdownOpen(prev => !prev);

    const getFormattedDate = () => {
        const d = new Date();
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`; // e.g., 10/6/2025
    };

    const getFileNameDate = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const exportCSV = () => {
        const dateString = getFormattedDate();

        const customRows = [
            ['NOT CLOCK IN STAFF', dateString],
            [],
            ['Staff Name', 'Phone Number', 'Email', 'Role', 'Status']
        ];

        const dataRows = notClockedInStaff.map(row => [
            row.name || '—',
            row.phone || '—',
            row.email || '—',
            row.roleId?.name || '—',
            'Not Clocked In'
        ]);

        const fullCSVData = [...customRows, ...dataRows];
        const csv = Papa.unparse(fullCSVData, { quotes: true });

        // Add BOM so Excel properly reads UTF-8 characters like "—"
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });

        saveAs(blob, `${getFileNameDate()}_NotClockedInStaff.csv`);
    };


    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`NOT CLOCK IN STAFF`, 14, 15);
        doc.setFontSize(12);
        doc.text(getFormattedDate(), 14, 22);

        const tableColumn = ['Staff Name', 'Phone Number', 'Email', 'Role', 'Status'];
        const tableRows = notClockedInStaff.map(row => [
            row.name || '—',
            row.phone || '—',
            row.email || '—',
            row.roleId?.name || '—',
            'Not Clocked In'
        ]);

        autoTable(doc, {
            startY: 30,
            head: [tableColumn],
            body: tableRows,
        });

        doc.save(`${getFileNameDate()}_NotClockedInStaff.pdf`);
    };

    const columns = [
        {
            name: 'Staff Name',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'Phone Number',
            selector: row => row.phone || '—',
        },
        {
            name: 'Email',
            selector: row => row.email || '—',
        },
        {
            name: 'Role',
            selector: row => row.roleId?.name || '—',
        },
        {
            name: 'Status',
            selector: () => 'Not Clocked In',
            cell: () => (
                <span style={{ fontWeight: 'bold', color: '#f55f0a' }}>
                    Not Clocked In
                </span>
            ),
        },
    ];

    const exportBtnStyle = {
        padding: '6px 12px',
        fontSize: '0.875rem',
        backgroundColor: '#7B61FF',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
    };

    if (loading) return <Col sm="12"><div>Loading...</div></Col>;
    if (error) return <Col sm="12"><div>{error}</div></Col>;

    return (
        <Col sm="12">
            <Card>
                <CardHeader className="d-flex justify-content-between align-items-center flex-wrap">
                    <h3 style={{ color: "#555555", marginBottom: '0.5rem' }}>Staff Not Clocked In Today</h3>

                    <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown} disabled={notClockedInStaff.length === 0}>
                        <DropdownToggle
                            tag="button"
                            className="btn"
                            style={{
                                ...exportBtnStyle,
                                opacity: notClockedInStaff.length === 0 ? 0.5 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}
                        >
                            Export <FaChevronDown />
                        </DropdownToggle>

                        <DropdownMenu end>
                            <DropdownItem onClick={exportCSV}>
                                <FaFileCsv style={{ marginRight: '8px' }} />
                                Export as CSV
                            </DropdownItem>
                            <DropdownItem onClick={exportPDF}>
                                <FaFilePdf style={{ marginRight: '8px' }} />
                                Export as PDF
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </CardHeader>

                <DataTable
                    columns={columns}
                    data={notClockedInStaff}
                    pagination
                    striped
                    highlightOnHover
                    responsive
                    noDataComponent={
                        <div style={{ fontSize: '1.3rem', padding: '1rem', textAlign: 'center' }}>
                            All staff have clocked in today.
                        </div>
                    }
                />
            </Card>
        </Col>
    );
};

export default TodayNotClockIn;
