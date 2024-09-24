// Header.js
import React, { useState, useRef, useEffect } from "react";
import { Settings, UserRoundPen, Mail, LogOut, MailCheck } from "lucide-react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Button } from "../ui/Button";
//import { Select } from "../components/ui/Select";
import { useRouter } from "next/router";
import "../../styles/components/headers.css";

const Header = ({ isOpen, toggleMenu, handleSubmit, url, setUrl }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const router = useRouter();

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
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  {
    /*
  const handlePropertyChange = (e) => {
    const selectedPropertyId = e.target.value;
    console.log("Selected Property Change:", selectedPropertyId);
    setSelectedPropertyId(selectedPropertyId); // 追加
    const property = filteredProperties.find(
      (p) => p.properties_id === selectedPropertyId
    );
    setSelectedProperty(property);
  };*/
  }

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
            //onKeyDown={handleKeyDown} //Enterキーを押すと処理が実行
            placeholder="URLを入力してください"
            className="header-input"
          />
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
          <span className="sr-only"></span>
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
              onClick={() => router.push("/setting/addAccount")}
              className="menu-button"
            >
              <Mail className="icon" />
              <div className="icon-text">アカウント追加</div>
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/setting/logout")}
              className="menu-button"
            >
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
