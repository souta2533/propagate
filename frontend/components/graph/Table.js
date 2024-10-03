import React from "react";
import MUIDataTable from "mui-datatables";
import { Download } from "lucide-react";

const getMuiTheme = () =>
  createTheme({
    overrides: {
      MUIDataTable: {
        root: {
          backgroundColor: "#fafafa", // テーブル全体の背景色を設定
        },
      },
      MUIDataTableBodyCell: {
        root: {
          padding: "10px", // セルのパディングを変更
          fontSize: "14px", // フォントサイズを変更
        },
      },
      MUIDataTableHeadCell: {
        root: {
          backgroundColor: "#3f51b5", // ヘッダーセルの背景色
          color: "#fff", // ヘッダーセルの文字色
        },
      },
    },
  });

const Table = ({ data, dataKey }) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid or empty data format");
    return null;
  }

  // `date`列と`dataKey`で指定された列を表示
  const columns = [
    { name: "date", label: "Date" },
    { name: dataKey || "defaultKey", label: dataKey || "Default Key" }, // 2列目がundefinedの場合はデフォルト値を設定
  ];

  // データをテーブル用に整形
  const tableData = data.map((item) => ({
    date: item.date, // 1列目は常に`date`
    [dataKey]: item[dataKey] ?? "", // 2列目は`dataKey`の値。無い場合は空白
  }));

  // options 設定（必要に応じてカスタマイズ可能）
  const options = {
    filterType: "checkbox",
    selectableRows: "none", // 行の選択を無効にする
    responsive: "standard", // scrollMaxHeightの代わりにstandardを使用
    download: false,
    print: false,
    search: false,
    viewColumns: false,
    rowsPerPageOptions: [5, 7, 10],
    textLabels: {
      body: {
        noMatch: "データが見つかりません",
      },
      pagination: {
        next: "次へ",
        previous: "前へ",
        rowsPerPage: "行数",
      },
    },
  };

  return (
    <MUIDataTable
      title={`${dataKey || "All Columns"}`}
      data={tableData} // 2行目以降のデータを提供
      columns={columns}
      options={options} // オプション設定
    />
  );
};

export default Table;

{
  /*
 // options 設定
 オプションの詳細
download: trueにすると、CSV形式でデータをダウンロードするためのボタンが表示されます。

例: download: falseにするとダウンロード機能が無効化されます。
print: trueにすると、テーブルデータを印刷するためのボタンが表示されます。

例: print: falseにするとプリント機能が無効化されます。
downloadOptions: ダウンロードオプションをカスタマイズできます。

filename: ダウンロード時のファイル名を設定します（例: filename: 'my_data.csv'）。
separator: CSVの区切り文字を指定します（例: separator: ','）。
selectableRows: 行選択のモードを設定できます。値は以下のいずれかです。

none: 行選択を無効にします。
single: 1行のみ選択可能にします。
multiple: 複数行選択可能にします。
responsive: テーブルのレスポンシブ対応のスタイルを設定できます。

例: responsive: "scrollMaxHeight"で、スクロール可能なテーブルを表示します。
filterType: フィルタリング方法を設定します。

例: filterType: "dropdown"で、ドロップダウン形式のフィルターを有効にします。
rowsPerPageOptions: 1ページに表示する行数の選択肢を設定します。

例: rowsPerPageOptions: [5, 10, 20]で、5、10、20行から選択できるようになります。
*/
}
