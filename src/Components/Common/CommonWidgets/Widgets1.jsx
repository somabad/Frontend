import React from 'react';
import { Card, CardBody } from 'reactstrap';
import { H4 } from '../../../AbstractElements';
import SvgIcon from '../Component/SvgIcon';

const colorMap = {
  secondary: '#6c757d',
  primary: '#0d6efd',
  success: '#198754',
  warning: '#ffc107',
  danger: '#dc3545',
  info: '#0dcaf0',
  light: '#f8f9fa',
  dark: '#212529',
};

const Widgets1 = ({ data }) => {
  const iconColor = colorMap[data.color];

  return (
    <Card className="widget-1" >
      <CardBody>
        <div className="widget-content">
          <div className={`widget-round ${data.color}`}>
            <div className="bg-round" >
              {React.isValidElement(data.icon) 
                ? React.cloneElement(data.icon, { style: { fontSize: '36px', color: iconColor } })
                : <SvgIcon 
                    className="svg-fill" 
                    style={{ width: '36px', height: '36px', color: iconColor }} 
                    iconId={`${data.icon}`} 
                  />
              }
              <SvgIcon className="half-circle svg-fill" iconId="halfcircle" style={{ color: iconColor }} />
            </div>
          </div>
          <div>
            <H4>{data.total}</H4>
            <span className="f-light">{data.title}</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default Widgets1;
