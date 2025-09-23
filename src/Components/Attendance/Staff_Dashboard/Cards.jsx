import React, { useState } from "react";
import { Row, Col, Card, CardBody } from "reactstrap";
import { FaUserClock, FaBusinessTime, FaClock, FaMapMarkerAlt } from "react-icons/fa";

const DashboardCards = ({ staffData }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const totalLateWeek = staffData?.totalLateHoursThisWeek || 0;
  const totalWorkWeek = staffData?.totalWorkHoursThisWeek || 0;
  const todayStatus = staffData?.clockLogToday?.[0]?.status || "Not Clocked";
  const assignedLocations = staffData?.assignedLocations?.length || 0;

  // Conditional styling for today's status card
  const isLate = todayStatus === "Late";

  const cards = [
    {
      icon: <FaUserClock size={28} color="#f97316" />,  // vivid orange icon
      label: "Late Hours (Week)",
      value: totalLateWeek.toFixed(2),
      unit: "H",
      bgColor: "#fff4e6",  // light orange background
      iconBg: "#ffd8a8",   // soft orange behind icon
    },
    {
      icon: <FaBusinessTime size={28} color="#2a9d8f" />,
      label: "Work Hours (Week)",
      value: totalWorkWeek.toFixed(2),
      unit: "H",
      bgColor: "#e6f4f1",
      iconBg: "#b8e0d4",
    },
    {
      icon: <FaClock size={28} color={isLate ? "#d00000" : "#007f5f"} />,
      label: "Today's Status",
      value: todayStatus,
      unit: "",
      bgColor: isLate ? "#ffe6e6" : "#e6fff2",
      iconBg: isLate ? "#ffcccc" : "#b8f5d3",
    },
    {
      icon: <FaMapMarkerAlt size={28} color="#6a4c93" />,
      label: "Assigned Locations",
      value: assignedLocations,
      unit: "",
      bgColor: "#f3e8fd",
      iconBg: "#d3bdf0",
    },
  ];

  const handleCardClick = (index) => {
    if (window.innerWidth <= 575.98) {
      setActiveIndex(activeIndex === index ? null : index);
    }
  };

  return (
    <>
      <Col xs="12" sm="12" md="6" lg="6" xl="6" xxl="6" className="mb-2">
        {/* First card */}
        <Row className="mb-3">
          <Col xs="6" sm="6" md="6" lg="6" xl="6" xxl="6">
            <Card
              className="h-100 shadow-sm border-0 rounded-3"
              style={{
                backgroundColor: cards[0].bgColor,
                cursor: "pointer",
                marginTop: 0,
              }}
              onClick={() => handleCardClick(0)}
            >
              <CardBody className="d-flex align-items-center gap-3 widget-card-body ">
                <div
                  className="icon-wrapper"
                  style={{
                    backgroundColor: cards[0].iconBg,
                    padding: "10px",
                    borderRadius: "15%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "48px",
                  }}
                >
                  {cards[0].icon}
                </div>
                <div className="text-content">
                  <h6 className="label-text mb-0 text-muted">{cards[0].label}</h6>
                  <h3 className="value-text mb-0 text-dark">
                    {cards[0].value}
                    {cards[0].unit}
                  </h3>
                </div>
              </CardBody>
              {activeIndex === 0 && (
                <div className="mobile-tooltip">
                  {cards[0].label}
                  <span className="tooltip-arrow" />
                </div>
              )}
            </Card>
          </Col>

          {/* Second card */}
          <Col xs="6" sm="6" md="6" lg="6" xl="6" xxl="6">
            <Card
              className="h-100 shadow-sm border-0 rounded-3"
              style={{
                backgroundColor: cards[1].bgColor,
                cursor: "pointer",
                marginTop: 0,
              }}
              onClick={() => handleCardClick(1)}
            >
              <CardBody className="d-flex align-items-center gap-3 widget-card-body ">
                <div
                  className="icon-wrapper"
                  style={{
                    backgroundColor: cards[1].iconBg,
                    padding: "10px",
                    borderRadius: "15%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "48px",
                  }}
                >
                  {cards[1].icon}
                </div>
                <div className="text-content">
                  <h6 className="label-text mb-0 text-muted">{cards[1].label}</h6>
                  <h3 className="value-text mb-0 text-dark">
                    {cards[1].value}
                    {cards[1].unit}
                  </h3>
                </div>
              </CardBody>
              {activeIndex === 1 && (
                <div className="mobile-tooltip">
                  {cards[1].label}
                  <span className="tooltip-arrow" />
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Third and fourth cards in another Row */}
        <Row>
          <Col xs="6" sm="6" md="6" lg="6" xl="6" xxl="6">
            <Card
              className="h-100 shadow-sm border-0 rounded-3"
              style={{
                backgroundColor: cards[2].bgColor,
                cursor: "pointer",
                marginTop: 0,
              }}
              onClick={() => handleCardClick(2)}
            >
              <CardBody className="d-flex align-items-center gap-3 widget-card-body">
                <div
                  className="icon-wrapper"
                  style={{
                    backgroundColor: cards[2].iconBg,
                    padding: "10px",
                    borderRadius: "15%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "48px",
                  }}
                >
                  {cards[2].icon}
                </div>
                <div className="text-content">
                  <h6 className="label-text mb-0 text-muted">{cards[2].label}</h6>
                  <h3 className="value-text mb-0 text-dark">
                    {cards[2].value}
                    {cards[2].unit}
                  </h3>
                </div>
              </CardBody>
              {activeIndex === 2 && (
                <div className="mobile-tooltip">
                  {cards[2].label}
                  <span className="tooltip-arrow" />
                </div>
              )}
            </Card>
          </Col>

          <Col xs="6" sm="6" md="6" lg="6" xl="6" xxl="6">
            <Card
              className="h-100 shadow-sm border-0 rounded-3"
              style={{
                backgroundColor: cards[3].bgColor,
                cursor: "pointer",
                marginTop: 0,
              }}
              onClick={() => handleCardClick(3)}
            >
              <CardBody className="d-flex align-items-center gap-3 widget-card-body">
                <div
                  className="icon-wrapper"
                  style={{
                    backgroundColor: cards[3].iconBg,
                    padding: "10px",
                    borderRadius: "15%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "20px",
                  }}
                >
                  {cards[3].icon}
                </div>
                <div className="text-content">
                  <h6 className="label-text mb-0 text-muted">{cards[3].label}</h6>
                  <h3 className="value-text mb-0 text-dark">
                    {cards[3].value}
                    {cards[3].unit}
                  </h3>
                </div>
              </CardBody>
              {activeIndex === 3 && (
                <div className="mobile-tooltip">
                  {cards[3].label}
                  <span className="tooltip-arrow" />
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Col>


      <style jsx>{`
        .label-text {
          font-size: 12px;
        }

        .value-text {
          font-size: 18px;
        }

        .dashboard-card-row {
          margin-left: 0;
          margin-right: 0;
        }

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

          .value-text {
            font-size: 16px;
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

          .dashboard-card-row {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
          }

           @media (max-width: 575.98px) {
      .my-col {
        margin-top: 1rem; /* equivalent to mt-3 */
      }
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

export default DashboardCards;
