import React from "react";
import MUIDataTable from "mui-datatables";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import "../../styles/components/sourceTable.css";

const getMuiTheme = () =>
  createTheme({
    components: {
      MUIDataTable: {
        styleOverrides: {
          paper: {
            boxShadow: "none",
          },
        },
      },
      MUIDataTableToolbar: {
        styleOverrides: {
          root: {
            display: "none",
          },
        },
      },
      MUIDataTableBodyCell: {
        styleOverrides: {
          root: {
            padding: "8px",
            fontSize: "15px",
          },
        },
      },
      MUIDataTableHeadCell: {
        styleOverrides: {
          root: {
            fontWeight: "bold",
            fontSize: "15px",
            padding: "10px",
          },
        },
      },
    },
  });
const Table = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  // `date`列と`dataKey`で指定された列を表示
  const columns = [
    { name: "number", label: "No" },
    { name: "query", label: "カテゴリ" },
    {
      name: "count",
      label: "流入数",
      options: {
        customBodyRender: (value) => (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
            }}
          >
            <span style={{ marginRight: "8px" }}>{value.toLocaleString()}</span>
            <div
              style={{
                width: "100%",
                height: "0.5vh",
                backgroundColor: "#e0e0e0",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: `${(value / data[0][1]) * 100}%`,
                  backgroundColor: "#25DFBB",
                  height: "100%",
                }}
              ></div>
            </div>
          </div>
        ),
      },
    }, // 2列目は`dataKey`で指定された列
  ];

  // データをテーブル用に整形
  const tableData = data.map((item, index) => {
    const row = {
      number: index + 1,
      query: item[0],
      count: item[1],
    };
    console.log(row);
    return row;
  });

  // options 設定（必要に応じてカスタマイズ可能）
  const options = {
    filterType: "dropdown",
    selectableRows: "none", // 行の選択を無効にする
    responsive: "vertical", // scrollMaxHeightの代わりにstandardを使用
    download: false,
    print: false,
    search: false,
    viewColumns: false,
    rowsPerPage: data.length,
    rowsPerPageOptions: [data.length],
    sort: true,
    pagination: false,
    textLabels: {
      body: {
        noMatch: "データが見つかりません",
      },
    },
  };

  return (
    <ThemeProvider theme={getMuiTheme()}>
      <MUIDataTable data={tableData} columns={columns} options={options} />
    </ThemeProvider>
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
