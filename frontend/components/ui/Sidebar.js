// Sidebar.js
import React from "react";
import Button from "@mui/material/Button";
import { Home, BarChart2, FileText, Link, HomeIcon } from "lucide-react";
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
          startIcon={<Home className="icon" />}
          className="menu-button"
        >
          <div className="icon-text">ホーム</div>
        </Button>
        <Button
          variant="ghost"
          onClick={() => handelButtonClick(propertyId)}
          startIcon={<BarChart2 className="icon" />}
          className="menu-button"
        >
          <div className="icon-text">ページ別状況</div>
        </Button>
        <Button
          variant="ghost"
          className="menu-button"
          startIcon={<FileText className="icon" />}
        >
          <div className="icon-text">アナリティクスレポート</div>
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push("../setting/urlSetting")}
          startIcon={<Link className="icon" />}
          className="menu-button"
        >
          <div className="icon-text">URL追加</div>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
