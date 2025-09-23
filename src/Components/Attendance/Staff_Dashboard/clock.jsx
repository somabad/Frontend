import React, { useEffect, useState } from 'react';
import { Col, Card, CardBody } from 'reactstrap';
import { H4 } from '../../../AbstractElements';

const DigitalClock = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const time = dateTime.toLocaleTimeString('en-MY', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const date = dateTime.toLocaleDateString('en-MY', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Col xl="6" sm="6" xs="12" xxl="6" className="digital-clock-col">
      <Card className="text-center digital-clock-card">
        <CardBody>
          <h4 style={{ marginBottom: '0', fontSize: '1.5rem', color:'#555555' }}>{date}</h4>
          <h2 style={{ fontWeight: 'bold', fontSize:'2rem', color:'#555555' }}>{time}</h2>
        </CardBody>
      </Card>

      <style jsx>{`
        .digital-clock-col {
          margin-bottom: 1rem !important;
          margin-top: 0rem !important
        }

        .digital-clock-card {
          margin-bottom: 0 !important;
          background-color :rgb(255, 255, 255) !important

        }
      `}</style>
    </Col>
  );
};

export default DigitalClock;
