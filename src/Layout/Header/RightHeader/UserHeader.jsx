import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "react-feather";

import { LI, UL, Image, P } from "../../../AbstractElements";
import CustomizerContext from "../../../_helper/Customizer";

const UserHeader = () => {
  const history = useNavigate();
  const [profileURL, setProfileURL] = useState("");
  const [name, setName] = useState("");
  const [userType, setUserType] = useState("");
  const { layoutURL } = useContext(CustomizerContext);
  const authenticated = JSON.parse(localStorage.getItem("authenticated"));
  const auth0_profile = JSON.parse(localStorage.getItem("auth0_profile"));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const storedName = localStorage.getItem("Name");
    const storedProfile = localStorage.getItem("profileURL");
    const storedUserType = sessionStorage.getItem("userType");

    setName(authenticated ? auth0_profile?.name : storedName || "");
    setProfileURL(authenticated ? auth0_profile?.picture : storedProfile || "");
    setUserType(storedUserType || "");
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const Logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem("authenticated", false);
    history(`/login`);
  };

  const getInitial = () => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  return (
    <li className="profile-nav pe-0 py-0" ref={dropdownRef} style={{ position: "relative", zIndex: 1050 }}>
      <style>{`
        .profile-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          z-index: 1050;
          background-color: #ffffff;
          border: 1px solid #dee2e6;
          border-radius: 0.5rem;
          width: fit-content;
          min-width: 90px;
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
          padding: 0.5rem 0;
          display: none;
        }
        .profile-dropdown.show {
          display: block;
        }
        .profile-dropdown li {
          display: flex;
          align-items: center;
          padding: 0.3rem 0.5rem; /* Reduced horizontal padding */
          font-size: 0.85rem;      /* Optional: smaller text */
          cursor: pointer;
          color: #212529;
          transition: background-color 0.2s;
          width: 100%;             /* Ensure it doesn't stretch wider than parent */
          white-space: nowrap;     /* Prevent text wrapping */
        }

        .profile-dropdown li:hover {
          background-color: #f8f9fa;
        }
        .profile-dropdown li svg {
          margin-right: 8px;
        }
        @media (max-width: 700px) {
          .profile-dropdown {
            left: auto !important;
            right: 0 !important;
            transform: none !important;
            margin-top: 5px;
            width: fit-content;
            min-width: 90px;
            max-width: 110px;
          }
        }
      `}</style>

      <div
        className="media profile-media"
        onClick={toggleDropdown}
        style={{ cursor: "pointer" }}
      >
        {profileURL ? (
          <Image
            attrImage={{
              className: "b-r-10 m-0",
              src: profileURL,
              alt: "Profile",
            }}
          />
        ) : (
          <div
            className="b-r-10 m-0 d-flex align-items-center justify-content-center"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#555555",
              color: "#fff",
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            {getInitial()}
          </div>
        )}
        <div className="media-body ms-2">
          <span>{name}</span>
          <P attrPara={{ className: "mb-0 font-roboto" }}>
            {userType} <i className="middle fa fa-angle-down"></i>
          </P>
        </div>
      </div>

      {dropdownOpen && (
        <UL attrUL={{ className: "simple-list profile-dropdown show" }}>
          <LI attrLI={{ onClick: Logout }}>
            <LogIn />
            <span>Logout</span>
          </LI>
        </UL>
      )}
    </li>
  );
};

export default UserHeader;
