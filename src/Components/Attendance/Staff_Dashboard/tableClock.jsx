import React, { Fragment } from 'react';
import { Col, Card, CardHeader, Table } from 'reactstrap';
import { H2 } from '../../../AbstractElements';

const TableClock = ({ staffData, loading }) => {
  const safeStaffData = staffData || {};
  const clockLogs = Array.isArray(safeStaffData.clockLogToday) ? safeStaffData.clockLogToday : [];
  const locations = Array.isArray(safeStaffData.assignedLocations) ? safeStaffData.assignedLocations : [];

  const getLocationName = (locationId) => {
    const loc = locations.find((l) => l.locationId === locationId);
    return loc ? loc.name : '—';
  };

  return (
    <Fragment>
      <Col xs="12" sm="12" md="12" lg="12" xl="12" xxl="12" className='mt-2'>
        <Card>
          <CardHeader>
            <H2 attrH2={{ style: { fontSize: '1.25rem', margin: 0, color: '#555555' } }}>
              Today's clock-in/out records.
            </H2>

          </CardHeader>

          <div className="table-responsive" style={{ paddingBottom: '3.3rem' }}>
            <Table className="table-border-horizontal table-hover">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      Loading clock logs...
                    </td>
                  </tr>
                ) : clockLogs.length > 0 ? (
                  clockLogs.map((log, index) => {
                    const date = log.clock_in
                      ? new Date(log.clock_in).toLocaleDateString('en-MY', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })
                      : log.clock_out
                        ? new Date(log.clock_out).toLocaleDateString('en-MY', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                          })
                        : '—';

                    return (
                      <tr key={index}>
                        <td>{date}</td>
                        <td>
                          {log.clock_in
                            ? new Date(log.clock_in).toLocaleTimeString('en-MY', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })
                            : '—'}
                        </td>
                        <td>
                          {log.clock_out
                            ? new Date(log.clock_out).toLocaleTimeString('en-MY', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })
                            : '—'}
                        </td>
                        <td>{getLocationName(log.locationId)}</td>
                        <td
                          className={
                            log.status === 'Late'
                              ? 'text-danger'
                              : log.status === 'On Time'
                                ? 'text-success'
                                : ''
                          }
                        >
                          {log.status || '—'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-danger">
                      Not clocked in yet
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card>
      </Col>
    </Fragment>
  );
};

export default TableClock;
