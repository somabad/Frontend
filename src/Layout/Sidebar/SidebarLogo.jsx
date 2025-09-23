import React, { useContext } from "react";
import { Grid } from "react-feather";
import { Link } from "react-router-dom";
import CustomizerContext from "../../_helper/Customizer";
import { Image } from "../../AbstractElements";
import TimeForce from "../../assets/images/logo/logo.png";

const SidebarLogo = () => {
  const { mixLayout, toggleSidebar, toggleIcon, layout, layoutURL } = useContext(CustomizerContext);

  const openCloseSidebar = () => {
    toggleSidebar(!toggleIcon);
  };

  const layout1 = localStorage.getItem("sidebar_layout") || layout;

  return (
    <div className='logo-wrapper'>
      {layout1 !== "compact-wrapper dark-sidebar" && layout1 !== "compact-wrapper color-sidebar" && mixLayout ? (
          <Image attrImage={{ className: "img-fluid d-inline", src: `${TimeForce}`, alt: "" }} />
      ) : (
          <Image attrImage={{ className: "img-fluid d-inline", src: `${TimeForce}`, alt: "" }} />
      )}
      <div className='back-btn' onClick={() => openCloseSidebar()}>
        <i className='fa fa-angle-left'></i>
      </div>
      <div className='toggle-sidebar' onClick={openCloseSidebar}>
        <Grid className='status_toggle middle sidebar-toggle' />
      </div>
    </div>
  );
};

export default SidebarLogo;
