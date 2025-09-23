import React from 'react';
import { Card, CardBody, Col } from 'reactstrap';
import { H4, P, Image } from '../../../AbstractElements';
import CarToon from '../../../assets/images/dashboard/cartoon.svg';

const GreetingCard = ({ staffData, error }) => {
  if (error) {
    return (
    <Col xs="12" sm="6" md="6" lg="6" xl="6" xxl="6" className='box-col-12'>
      <Card className='profile-box custom-card-color' >
          <CardBody>
            <P>{error}</P>
          </CardBody>
        </Card>
      </Col>
    );
  }

  if (!staffData) {
    return (
    <Col xs="12" sm="6" md="6" lg="6" xl="6" xxl="6" className='box-col-12'>
      <Card className='profile-box custom-card-color' >
          <CardBody>
            <P>Loading...</P>
          </CardBody>
        </Card>
      </Col>
    );
  }

  return (
    <Col xs="12" sm="6" md="6" lg="6" xl="6" xxl="6" className='box-col-12'>
      <style>
        {`
      .responsive-image {
        max-width: 100%;
        height: auto;
        max-height: 150px;
        margin: 0 auto;
      }

      .custom-card-color {
    background:rgb(255, 255, 255) !important;
    }

      @media (max-width: 1440px) {
        .responsive-image {
          max-height: 200px;
        }
      }

      @media (max-width: 1024px) {
        .responsive-image {
          max-height: 250px;
        }
      }

      @media (max-width: 767px) {
        .responsive-image {
          max-height: 300px;
        }
      }

      @media (max-width: 480px) {
        .responsive-image {
          max-height: 350px;
        }
      }
    `}
      </style>

      <Card className='profile-box custom-card-color' >
        <CardBody className="text-center">
          <div
            className='greeting-user'
            style={{
              marginBottom: '1.5rem',
              textAlign: 'left',
              maxHeight: '80px',
              overflow: 'hidden'
            }}
          >
            <H4 attrH4={{ className: 'f-w-600', style: { fontSize: '18px', color: '#555555' } }}>
              Welcome, {staffData.name || 'Staff'}
            </H4>
            <p style={{ color: '#555555' }}>Let's get to work now!</p>
          </div>

          <div className='cartoon'>
            <Image
              attrImage={{
                src: CarToon,
                alt: 'vector woman with laptop',
                className: 'responsive-image'
              }}
            />
          </div>
        </CardBody>
      </Card>
    </Col>

  );
};

export default GreetingCard;
