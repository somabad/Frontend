import React, { useState } from "react";
import { Row, Col, Card, CardBody } from "reactstrap";
import { FaArrowRotateRight, FaClipboardList } from "react-icons/fa6"; 
import { FaCalendarCheck, FaChartBar, FaCalendarMinus, FaCalendarDay, FaLayerGroup, FaCalendarXmark } from "react-icons/fa6"; 
import { AiOutlineInfoCircle } from "react-icons/ai";

const WidgetWraper = ({
  carryFowardDays,
  entitledDays,
  totalEntitlement,
  usedDays,
  balanceThisYear,
  balanceByType,
  totalBalance,
  usedUnpaidLeave,
}) => {
  const [hoveredInfoIndex, setHoveredInfoIndex] = useState(null);

  // Extract used unpaid leave from balanceByType
  const getUsedUnpaidLeave = () => {
    if (!balanceByType) return 0;
    
    // Look for unpaid leave in balanceByType (case insensitive)
    const unpaidEntry = Object.entries(balanceByType).find(([type]) => 
      type.toLowerCase().includes('unpaid')
    );
    
    return unpaidEntry ? unpaidEntry[1].used : 0;
  };

  const usedUnpaidLeaveData = getUsedUnpaidLeave();

  const cards = [
    { icon: <FaArrowRotateRight size={36} color="#FF8C42" />, label: "Carry Forward Days", value: carryFowardDays, bgColor: "#FFF3E0", iconBg: "#FFDAB3", info: "Days carried forward from last year" },
    { icon: <FaCalendarCheck size={36} color="#4DB6AC" />, label: "Entitled Days", value: entitledDays, bgColor: "#E0F2F1", iconBg: "#B2DFDB", info: "Total days you are entitled to this year" },
    { icon: <FaChartBar size={36} color="#7986CB" />, label: "Total Entitlement", value: totalEntitlement, bgColor: "#E8EAF6", iconBg: "#C5CAE9", info: "Sum of all leave entitlements" },
    { icon: <FaCalendarMinus size={36} color="#FFB74D" />, label: "Used Days", value: usedDays, bgColor: "#FFF8E1", iconBg: "#FFE0B2", info: "Days you have already used" },
    { icon: <FaCalendarDay size={36} color="#BA68C8" />, label: "Balance This Year", value: balanceThisYear, bgColor: "#F3E5F5", iconBg: "#E1BEE7", info: "Remaining days for this year" },
    { icon: <FaClipboardList size={36} color="#4FC3F7" />, label: "Total Balance", value: totalBalance, bgColor: "#E1F5FE", iconBg: "#B3E5FC", info: "Total leave balance including carry forward" },
    { icon: <FaCalendarXmark size={36} color="#F06292" />, label: "Used Unpaid Leave", value: usedUnpaidLeaveData, bgColor: "#FCE4EC", iconBg: "#F8BBD9", info: "Unpaid leave days you have used" },
    { icon: <FaLayerGroup size={36} color="#AED581" />, label: "Balance By Type", value: null, bgColor: "#F1F8E9", iconBg: "#DCEDC8", info: "Remaining days separated by leave type", typeDetails: balanceByType }
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
                  {label !== "Balance By Type" ? (
                    <h3 className="value-text mb-0 text-dark">{value}</h3>
                  ) : null}
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Fullscreen overlay on hover */}
      {hoveredInfoIndex !== null && (
        <div className="info-overlay">
          <div className="info-box">
            <p>{cards[hoveredInfoIndex].info}</p>
            {cards[hoveredInfoIndex].label === "Balance By Type" && cards[hoveredInfoIndex].typeDetails && (
              <table style={{ width: "100%", marginTop: "12px", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "6px", borderBottom: "1px solid #eee" }}>Leave Type</th>
                    <th style={{ textAlign: "center", padding: "6px", borderBottom: "1px solid #eee" }}>Used</th>
                    <th style={{ textAlign: "center", padding: "6px", borderBottom: "1px solid #eee" }}>Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(cards[hoveredInfoIndex].typeDetails)
                    .filter(([type]) => !type.toLowerCase().includes('unpaid'))
                    .map(([type, data], idx) => (
                    <tr key={idx}>
                      <td style={{ padding: "6px", borderBottom: "1px solid #eee" }}>{type}</td>
                      <td style={{ textAlign: "center", padding: "6px", borderBottom: "1px solid #eee" }}>{data.used}</td>
                      <td style={{ textAlign: "center", padding: "6px", borderBottom: "1px solid #eee" }}>{data.remaining}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .info-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          pointer-events: none;
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
