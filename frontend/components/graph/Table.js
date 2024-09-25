import React from "react";
import MUIDataTable from "mui-datatables";

const Table = ({ data }) => {
  // データが2D配列であり、かつデータが存在するかを確認
  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid or empty data format");
    return null;
  }

  // 1行目を列名として読み取る
  const columns = data[0]; // データの最初の行を列名として取得
  const tableData = data.slice(1); // 2行目以降をテーブルのデータとして使用

  // options 設定（必要に応じてカスタマイズ可能）
  const options = {
    filterType: "checkbox",
    selectableRows: "none", // 行の選択を無効にする
    responsive: "standard", // レスポンシブ設定
  };

  return (
    <MUIDataTable
      title="Dynamic Table"
      data={tableData} // 2行目以降のデータを提供
      columns={columns} // 1行目を列名として使用
      options={options} // オプション設定
    />
  );
};

export default Table;
