import React, { Fragment } from 'react';


import UserHeader from './UserHeader';
import { UL } from '../../../AbstractElements';
import { Col } from 'reactstrap';

const RightHeader = () => {
  return (
    <Fragment>
      <Col xxl='7' xl='6' md='7' className='nav-right pull-right right-header col-8 p-0 ms-auto'>
        {/* <Col md="8"> */}
        <UL attrUL={{ className: 'simple-list nav-menus flex-row' }}>
          <UserHeader />
        </UL>
        {/* </Col> */}
      </Col>
    </Fragment>
  );
};

export default RightHeader;