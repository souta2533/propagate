// Sidebar.js
import React from "react";
import { Button } from "../ui/Button";
import { Home, BarChart2, FileText } from "lucide-react";
import { useRouter } from "next/router";

const Sidebar = ({ isOpen }) => {
  const router = useRouter();
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
          onClick={() => router.push("/details")}
          className="menu-button"
        >
          <BarChart2 className="icon" />
          <div className="icon-text">ページ別状況</div>
        </Button>
        <Button variant="ghost" className="menu-button">
          <FileText className="icon" />
          <div className="icon-text">アナリティクスレポート</div>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
