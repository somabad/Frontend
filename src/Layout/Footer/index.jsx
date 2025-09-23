import React, { Fragment } from 'react';
import { Col, Container, Row } from 'reactstrap';
import { P } from '../../AbstractElements';
 
const Footer = () => {
  return (
    <Fragment>
      <footer className="footer bg-light py-3 shadow-sm">
        <Container fluid>
          <Row className="justify-content-center text-center">
            <Col xs="12" sm="12" md="10" lg="8" xl="6">
              <P attrPara={{ className: "mb-1 text-muted" }}>
                <span style={{ fontWeight: '500', fontSize: '0.95rem' }}>
                  Developed by <span>Infinicore</span> &nbsp;|&nbsp; 
                  Design by <span style={{ color: '#de5d83' }}>Le</span>
                  <span style={{ color: '#6f42c1' }}>Moon</span>
                </span>
              </P>
              <P attrPara={{ className: "mb-0 text-muted" }} style={{ fontSize: '0.85rem' }}>
                © 2025 <span style={{ fontWeight: '500' }}>Infinicore</span>. All rights reserved.
              </P>
            </Col>
          </Row>
        </Container>
      </footer>
    </Fragment>
  );
};

export default Footer;
