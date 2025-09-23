import React, { Fragment, useState, useEffect, useContext, useMemo } from "react";
import { useLocation } from "react-router-dom";
import CustomContext from "../../_helper/Customizer";
import { getMenuItems } from "./Menu";
import SidebarIcon from "./SidebarIcon";
import SidebarLogo from "./SidebarLogo";
import SidebarMenu from "./SidebarMenu";

const Sidebar = (props) => {
  const customizer = useContext(CustomContext);
  const { toggleIcon } = customizer;
  const location = useLocation();

  const layout = useMemo(() => {
    const id = window.location.pathname.split("/").pop();
    return id || Object.keys(customizer.layout).join();
  }, [window.location.pathname, customizer.layout]);

  const [mainMenu, setMainMenu] = useState({ mainmenu: getMenuItems() });
  const [width, setWidth] = useState(0);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [fromMenuClick, setFromMenuClick] = useState(false); // NEW: track if nav was from menu

  useEffect(() => {
    const menuItems = getMenuItems();
    const currentUrl = location.pathname;

    menuItems.forEach((menuItem) => {
      menuItem.Items.forEach((item) => {
        item.active = item.path === currentUrl;

        if (item.children) {
          item.children.forEach((child) => {
            child.active = child.path === currentUrl;

            if (child.children) {
              child.children.forEach((subChild) => {
                subChild.active = subChild.path === currentUrl;
              });
            }
          });
        }
      });
    });

    setMainMenu({ mainmenu: menuItems });

    // ✅ Only close if nav was from menu click (on mobile)
    if (window.innerWidth <= 768 && fromMenuClick) {
      setSidebarOpen(false);
      setFromMenuClick(false); // reset
    }

  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth - 500);
    };
    const handleScroll = () => {
      const sidebar = document.querySelector(".sidebar-main");
      if (!sidebar) return;
      sidebar.className = window.scrollY > 400 ? "sidebar-main hovered" : "sidebar-main";
    };

    handleResize();
    handleScroll();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const setNavActive = (item, menuItems) => {
    menuItems.forEach((menuItem) => {
      menuItem.Items.forEach((menuChild) => {
        menuChild.active = menuChild === item;

        if (menuChild.children) {
          menuChild.children.forEach((subItem) => {
            subItem.active = subItem === item;

            if (subItem.children) {
              subItem.children.forEach((subSubItem) => {
                subSubItem.active = subSubItem === item;
              });
            }
          });
        }
      });
    });

    setMainMenu({ mainmenu: menuItems });

    // ✅ Trigger close-on-mobile only when menu is clicked
    setFromMenuClick(true);
  };

  const closeOverlay = () => {
    setSidebarOpen(false);
  };

  return (
    <Fragment>
      {/* Overlay */}
      <div
        className={`bg-overlay1 ${isSidebarOpen ? "active" : ""}`}
        onClick={closeOverlay}
      ></div>

      {/* Sidebar */}
      <div
        className={`sidebar-wrapper ${toggleIcon ? "close_icon" : ""} ${isSidebarOpen ? "active" : ""}`}
        sidebar-layout="stroke-svg"
      >
        <SidebarIcon />
        <SidebarLogo />
        <SidebarMenu
          setMainMenu={setMainMenu}
          props={props}
          setNavActive={(item) => setNavActive(item, mainMenu.mainmenu)}
          activeClass={() => setSidebarOpen(true)}
          width={width}
        />
      </div>
    </Fragment>
  );
};

export default Sidebar;
