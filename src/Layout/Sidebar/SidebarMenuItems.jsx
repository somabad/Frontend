import React, { Fragment, useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import SvgIcon from "../../Components/Common/Component/SvgIcon";
import CustomizerContext from "../../_helper/Customizer";
import { getMenuItems } from "./Menu";

const SidebarMenuItems = ({ setMainMenu, sidebartoogle, setNavActive, activeClass }) => {
  const { layout } = useContext(CustomizerContext);
  const layout1 = localStorage.getItem("sidebar_layout") || layout;

  const location = useLocation();
  const currentPath = location.pathname;

  const [menuItems, setMenuItems] = useState(getMenuItems());

  const { t } = useTranslation();

  // Reset active state
  const resetActiveStates = (items) => {
    items.forEach((item) => {
      item.active = false;
      if (item.children) resetActiveStates(item.children);
    });
  };

  // Toggle navigation active item
  const toggleNavActive = (clickedItem) => {
    const newMenu = JSON.parse(JSON.stringify(menuItems));
    resetActiveStates(newMenu);

    const activateItem = (items) => {
      for (let item of items) {
        if (item.title === clickedItem.title) {
          item.active = !clickedItem.active;
          break;
        }
        if (item.children) activateItem(item.children);
      }
    };

    activateItem(newMenu);
    setMenuItems(newMenu);
    setMainMenu({ mainmenu: newMenu });

    if (window.innerWidth <= 991) {
      const pageHeader = document.querySelector(".page-header");
      const sidebarWrapper = document.querySelector(".sidebar-wrapper");
      if (clickedItem.type === "sub") {
        pageHeader.classList.remove("close_icon");
        sidebarWrapper.classList.remove("close_icon");
      } else {
        pageHeader.classList.add("close_icon");
        sidebarWrapper.classList.add("close_icon");
      }
    }

    setNavActive(clickedItem);
    activeClass(!clickedItem.active);
  };

  // Automatically set active based on current route
  useEffect(() => {
    const newMenu = JSON.parse(JSON.stringify(getMenuItems()));

    const updateActiveStates = (items) => {
      if (!Array.isArray(items)){
      for (let item of items) {
        if (item.path){
          item.active = currentPath.toLowerCase().includes(item.path.toLowerCase());
        }
        if (item.children){
          updateActiveStates(item.children);
        }
          if (item.children.some((child) => child.active)) {
            item.active = true;
          }
        }
      }
    };

    newMenu.forEach((section) => {
      if (Array.isArray(section.Items)) {
        updateActiveStates(section.Items)}});
    setMenuItems(newMenu);
    setMainMenu({ mainmenu: newMenu });
  }, [currentPath, setMainMenu]);

  return (
    <>
      {menuItems.map((section, i) => (
        <Fragment key={i}>
          <li className="sidebar-main-title">
            <div>
              <h6 className="lan-1">{t(section.menutitle)}</h6>
            </div>
          </li>
          {section.Items?.map((menuItem, index) => (
            <li className="sidebar-list" key={index}>
              {menuItem.type === "sub" && (
                <button
                  type="button"
                  className={`sidebar-link sidebar-title ${
                    (currentPath.toLowerCase().includes(menuItem.path.toLowerCase()) || menuItem.active) ? "active" : ""
                  }`}
                  onClick={() => toggleNavActive(menuItem)}
                >
                  <SvgIcon className="stroke-icon" iconId={`stroke-${menuItem.icon}`} />
                  <SvgIcon className="fill-icon" iconId={`fill-${menuItem.icon}`} />
                  <span>{t(menuItem.title)}</span>
                  {menuItem.badge && <label className={menuItem.badge}>{menuItem.badgetxt}</label>}
                  <div className="according-menu">
                    {menuItem.active ? <i className="fa fa-angle-down"></i> : <i className="fa fa-angle-right"></i>}
                  </div>
                </button>
              )}

              {menuItem.type === "link" && (
                <Link
                  to={menuItem.path}
                  className={`sidebar-link sidebar-title link-nav ${
                    currentPath.toLowerCase().includes(menuItem.path.toLowerCase()) ? "active" : ""
                  }`}
                  onClick={() => toggleNavActive(menuItem)}
                >
                  <SvgIcon className="stroke-icon" iconId={`stroke-${menuItem.icon}`} />
                  <SvgIcon className="fill-icon" iconId={`fill-${menuItem.icon}`} />
                  <span>{t(menuItem.title)}</span>
                  {menuItem.badge && <label className={menuItem.badge}>{menuItem.badgetxt}</label>}
                </Link>
              )}

              {menuItem.children && (
                <ul
                  className="sidebar-submenu"
                  style={
                    layout1 !== "compact-sidebar compact-small"
                      ? (menuItem.active || currentPath.toLowerCase().includes(menuItem.path.toLowerCase()))
                        ? sidebartoogle
                          ? { opacity: 1, transition: "opacity 500ms ease-in" }
                          : { display: "block" }
                        : { display: "none" }
                      : { display: "none" }
                  }
                >
                  {menuItem.children.map((child, idx) => (
                    <li key={idx}>
                      {child.type === "sub" && (
                        <button
                          type="button"
                          className={currentPath.toLowerCase().includes(child.path.toLowerCase()) ? "active" : ""}
                          onClick={() => toggleNavActive(child)}
                        >
                          {t(child.title)}
                          <span className="sub-arrow">
                            <i className="fa fa-chevron-right"></i>
                          </span>
                          <div className="according-menu">
                            {child.active ? <i className="fa fa-angle-down"></i> : <i className="fa fa-angle-right"></i>}
                          </div>
                        </button>
                      )}

                      {child.type === "link" && (
                        <Link
                          to={child.path}
                          className={currentPath.toLowerCase().includes(child.path.toLowerCase()) ? "active" : ""}
                          onClick={() => toggleNavActive(child)}
                        >
                          {t(child.title)}
                        </Link>
                      )}

                      {child.children && (
                        <ul
                          className="nav-sub-childmenu submenu-content"
                          style={
                            child.active || currentPath.toLowerCase().includes(child.path.toLowerCase())
                              ? { display: "block" }
                              : { display: "none" }
                          }
                        >
                          {child.children.map((subChild, key) => (
                            <li key={key}>
                              {subChild.type === "link" && (
                                <Link
                                  to={subChild.path}
                                  className={currentPath.toLowerCase().includes(subChild.path.toLowerCase()) ? "active" : ""}
                                  onClick={() => toggleNavActive(subChild)}
                                >
                                  {t(subChild.title)}
                                </Link>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </Fragment>
      ))}
    </>
  );
};

export default SidebarMenuItems;
