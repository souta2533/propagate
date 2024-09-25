// Sidebar.js
import React from "react";
import { Button } from "../ui/Button";
import { Home, BarChart2, FileText, Link } from "lucide-react";
import { useRouter } from "next/router";
import "../../styles/components/sidebar.css";

const Sidebar = ({ isOpen }) => {
  //detailsのリンクにpropertyIdを紐づける
  const handelButtonClick = (propertyId) => {
    router.push(`/${propertyId}/details`);
  };
  const router = useRouter();
  const { propertyId } = router.query;

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="menu-list">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className="menu-button"
        >
          <Home className="icon" />
          <div className="icon-text">ホーム</div>
        </Button>
        <Button
          variant="ghost"
          onClick={() => handelButtonClick(propertyId)}
          className="menu-button"
        >
          <BarChart2 className="icon" />
          <div className="icon-text">ページ別状況</div>
        </Button>
        <Button variant="ghost" className="menu-button">
          <FileText className="icon" />
          <div className="icon-text">アナリティクスレポート</div>
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push("../setting/urlSetting")}
          className="menu-button"
        >
          <Link className="icon" />
          <div className="icon-text">URL追加</div>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
