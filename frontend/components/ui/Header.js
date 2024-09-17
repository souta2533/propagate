// Header.js
import React, { useState, useRef, useEffect } from "react";
import { Settings, UserRoundPen, Mail, LogOut, MailCheck } from "lucide-react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Button } from "../ui/Button";
import "../../styles/headers.css";

const Header = ({ isOpen, toggleMenu, handleSubmit, url, setUrl }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <header className="header">
      <div className="header-left">
        <div className="hamburger-icon" onClick={toggleMenu}>
          {isOpen ? <FaTimes size={30} /> : <FaBars size={30} />}
        </div>
        <h1 className="header-title">Propagate Analytics</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="header-input"
          />
          {/*<button type="submit"></button>*/}
        </form>
      </div>
      <div className="header-right">
        <Button
          size="icon"
          variant="ghost"
          className="header-button"
          ref={buttonRef}
          onClick={toggleDropdown}
        >
          <Settings className="icon" />
          <span className="sr-only">Settings</span>
        </Button>
        {isDropdownOpen && (
          <div ref={dropdownRef} className="dropdown-menu">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="menu-button"
            >
              <UserRoundPen className="icon" />
              <div className="icon-text">プロフィール</div>
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/details")}
              className="menu-button"
            >
              <Mail className="icon" />
              <div className="icon-text">メール設定</div>
            </Button>
            <Button variant="ghost" className="menu-button">
              <LogOut className="icon" />
              <div className="icon-text">ログアウト</div>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
