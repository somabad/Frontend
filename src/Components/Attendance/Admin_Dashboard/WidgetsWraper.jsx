import React, { useState } from "react";
import { Row, Col, Card, CardBody } from "reactstrap";
import { FaUsers, FaMapMarkedAlt, FaClock, FaUserClock } from "react-icons/fa";

const WidgetWraper = ({
  totalStaff,
  totalLocation,
  totalClockInToday,
  totalLateToday,
}) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const cards = [
    {
      icon: <FaUsers size={36} color="#4e73df" />,
      label: "Total Staff",
      value: totalStaff,
      bgColor: "#e6ecfa",
      iconBg: "#d0d9f6",
    },
    {
      icon: <FaMapMarkedAlt size={36} color="#1cc88a" />,
      label: "Total Locations",
      value: totalLocation,
      bgColor: "#e6f9f2",
      iconBg: "#c9f3e1",
    },
    {
      icon: <FaClock size={36} color="#f6c23e" />,
      label: "Clock In Today",
      value: totalClockInToday,
      bgColor: "#fff8e6",
      iconBg: "#ffeebf",
    },
    {
      icon: <FaUserClock size={36} color="#e74a3b" />,
      label: "Late Today",
      value: totalLateToday,
      bgColor: "#fdecea",
      iconBg: "#fbd0cd",
    },
  ];

  const handleCardClick = (index) => {
    if (window.innerWidth <= 575.98) {
      setActiveIndex(activeIndex === index ? null : index);
    }
  };

  return (
    <>
      <Row className="g-4">
        {cards.map(({ icon, label, value, bgColor, iconBg }, index) => (
          <Col key={index} xs="6" sm="6" md="6" lg="3">
            <Card
              className="shadow-sm border-0 rounded-3 position-relative"
              style={{ backgroundColor: bgColor, cursor: "pointer" }}
              onClick={() => handleCardClick(index)}
            >
              <CardBody className="d-flex align-items-center gap-3 widget-card-body">
                <div
                  className="icon-wrapper"
                  style={{
                    backgroundColor: iconBg,
                    padding: "12px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "56px",
                  }}
                >
                  {icon}
                </div>
                <div className="text-content">
                  <h6 className="label-text mb-0 text-muted">{label}</h6>
                  <h3 className="value-text mb-0 text-dark">{value}</h3>
                </div>
              </CardBody>

              {/* Stylish Mobile Tooltip */}
              {activeIndex === index && (
                <div className="mobile-tooltip">
                  {label}
                  <span className="tooltip-arrow" />
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      <style jsx>{`
        @media (max-width: 575.98px) {
          .label-text {
            display: none;
          }
          .widget-card-body {
            justify-content: center !important;
          }
          .text-content {
            text-align: center;
          }

          .mobile-tooltip {
            position: absolute;
            top: -38px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #222;
            color: #fff;
            padding: 6px 12px;
            font-size: 13px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 20;
            animation: fadeIn 0.2s ease-in-out;
            white-space: nowrap;
            font-weight: 500;
          }

          .tooltip-arrow {
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 6px solid #222;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateX(-50%) translateY(5px);
            }
            to {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
          }
        }
      `}</style>
    </>
  );
};

export default WidgetWraper;
