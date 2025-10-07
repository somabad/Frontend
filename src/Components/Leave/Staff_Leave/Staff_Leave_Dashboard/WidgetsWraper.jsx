import React, { useState } from "react";
import { Row, Col, Card, CardBody } from "reactstrap";
import { FaArrowRotateRight, FaClipboardList } from "react-icons/fa6"; 
import { FaCalendarCheck } from "react-icons/fa6";
import { FaChartBar } from "react-icons/fa"; 
import { FaCalendarMinus } from "react-icons/fa6"; 
import { FaCalendarDay } from "react-icons/fa6"; 
import { FaLayerGroup } from "react-icons/fa6"; 
import { AiOutlineInfoCircle } from "react-icons/ai";

const WidgetWraper = ({
  carryFowardDays,
  entitledDays,
  totalEntitlement,
  usedDays,
  balanceThisYear,
  balanceByType,
  totalBalance,
}) => {
  const [hoveredInfoIndex, setHoveredInfoIndex] = useState(null);

  const cards = [
    { icon: <FaArrowRotateRight size={36} color="#FF8C42" />, label: "Carry Forward Days", value: carryFowardDays, bgColor: "#FFF3E0", iconBg: "#FFDAB3", info: "Days carried forward from last year" },
    { icon: <FaCalendarCheck size={36} color="#4DB6AC" />, label: "Entitled Days", value: entitledDays, bgColor: "#E0F2F1", iconBg: "#B2DFDB", info: "Total days you are entitled to this year" },
    { icon: <FaChartBar size={36} color="#7986CB" />, label: "Total Entitlement", value: totalEntitlement, bgColor: "#E8EAF6", iconBg: "#C5CAE9", info: "Sum of all leave entitlements" },
    { icon: <FaCalendarMinus size={36} color="#FFB74D" />, label: "Used Days", value: usedDays, bgColor: "#FFF8E1", iconBg: "#FFE0B2", info: "Days you have already used" },
    { icon: <FaCalendarDay size={36} color="#BA68C8" />, label: "Balance This Year", value: balanceThisYear, bgColor: "#F3E5F5", iconBg: "#E1BEE7", info: "Remaining days for this year" },
    { icon: <FaClipboardList size={36} color="#4FC3F7" />, label: "Total Balance", value: totalBalance, bgColor: "#E1F5FE", iconBg: "#B3E5FC", info: "Total leave balance including carry forward" },
    { icon: <FaLayerGroup size={36} color="#AED581" />, label: "Balance By Type", value: balanceByType, bgColor: "#F1F8E9", iconBg: "#DCEDC8", info: "Remaining days separated by leave type" }
  ];

  return (
    <>
      <Row className="g-4">
        {cards.map(({ icon, label, value, bgColor, iconBg, info }, index) => (
          <Col key={index} xs="6" sm="6" md="6" lg="3">
            <Card
              className="shadow-sm border-0 rounded-3 position-relative"
              style={{ backgroundColor: bgColor }}
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

                <div className="text-content" style={{ position: "relative" }}>
                  <h6 className="label-text mb-0 text-muted d-flex align-items-center gap-1">
                    {label}
                    <AiOutlineInfoCircle
                      size={16}
                      color="#888"
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() => setHoveredInfoIndex(index)}
                      onMouseLeave={() => setHoveredInfoIndex(null)}
                    />
                  </h6>
                  <h3 className="value-text mb-0 text-dark">{value}</h3>
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Fullscreen overlay on hover */}
      {hoveredInfoIndex !== null && (
        <div className="info-overlay">
          <div className="info-box">{cards[hoveredInfoIndex].info}</div>
        </div>
      )}

      <style jsx>{`
        .info-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0,0,0,0.6); /* faded background */
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          pointer-events: none; /* allows hover out */
        }

        .info-box {
          background-color: #fff;
          padding: 24px 32px;
          border-radius: 12px;
          max-width: 90%;
          text-align: center;
          font-size: 18px;
          font-weight: 500;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
      `}</style>
    </>
  );
};

export default WidgetWraper;
