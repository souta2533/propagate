// Header.js
import React, { useState, useRef, useEffect } from "react";
import { Settings, UserRoundPen, Mail, LogOut, MailCheck } from "lucide-react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Button } from "../ui/Button";
//import { Select } from "../components/ui/Select";
import { useRouter } from "next/router";
import "../../styles/components/headers.css";

const Header = ({ isOpen, toggleMenu, handleSubmit, url, setUrl, urlList }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredUrls, setFilteredUrls] = useState([]); // フィルタリングされたURL
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const router = useRouter();

  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState);
  };

  // URLリストに新しいURLを追加
  const addUrlToList = (newUrl) => {
    if (newUrl && !urlList.includes(newUrl)) {
      setUrlList((prevList) => [...prevList, newUrl]);
    }
  };

  // URLの入力に応じてフィルタリングされたリストを更新
  useEffect(() => {
    if (url) {
      const filtered = urlList.filter((item) =>
        item.toLowerCase().includes(url.toLowerCase())
      );
      setFilteredUrls(filtered);
      setIsDropdownOpen(filtered.length > 0); // 一致する項目がある場合はドロップダウンを開く
    } else {
      setFilteredUrls([]);
      setIsDropdownOpen(false);
    }
  }, [url, urlList]);

  // URLリストの項目をクリックしたときにそのURLをインプットにセット
  const handleSelectUrl = (selectedUrl) => {
    setUrl(selectedUrl);
    setIsDropdownOpen(false); // ドロップダウンを閉じる
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
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            //onKeyDown={handleKeyDown} //Enterキーを押すと処理が実行
            placeholder="URL追加メニューでURLを追加してください"
            className="header-input"
          />
          {isDropdownOpen && (
            <ul className="dropdown-list">
              {filteredUrls.map((item, index) => (
                <li
                  key={index}
                  className="dropdown-item"
                  onClick={() => handleSelectUrl(item)} // クリックでURLを選択
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
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
