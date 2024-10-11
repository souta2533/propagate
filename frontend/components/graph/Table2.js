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
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "15vw",
            "@media (max-width: 768px)": {
              fontSize: "12px",
              padding: "6px",
              maxWidth: "40vw", // 小さい画面での列幅を調整
            },
          },
        },
      },
      MUIDataTableHeadCell: {
        styleOverrides: {
          root: {
            fontWeight: "bold",
            fontSize: "15px",
            padding: "10px",
            backgroundColor: "#f9f9f9",
            position: "sticky",
            top: 0,
            zIndex: 50,
            "@media (max-width: 768px)": {
              fontSize: "12px",
              padding: "6px",
            },
          },
        },
      },
    },
  });

const Table2 = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }
  
  const totalCount = data.reduce((sum, item) => sum + item[1], 0);

  const columns = [
    {
      name: "number",
      label: "No",
      options: {
        setCellProps: () => ({
          style: {
            width: "5%",
            "@media (max-width: 768px)": {
              width: "10%",
            },
          },
        }),
      },
    },
    {
      name: "query",
      label: "カテゴリ",
      options: {
        setCellProps: () => ({
          style: {
            width: "15%",
            "@media (max-width: 768px)": {
              width: "40%",
            },
          },
        }),
      },
    },
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
            <span style={{ marginRight: "16px" }}>
              {value.toLocaleString()}
            </span>
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
                  width: `${(value / totalCount) * 100}%`,
                  backgroundColor: "#25DFBB",
                  height: "100%",
                }}
              ></div>
            </div>
          </div>
        ),
        setCellProps: () => ({
          style: {
            width: "80%",
            "@media (max-width: 768px)": {
              width: "50%",
            },
          },
        }),
      },
    },
  ];

  const tableData = data.map((item, index) => ({
    number: index + 1,
    query: item[0],
    count: item[1],
  }));

  const options = {
    filterType: "dropdown",
    selectableRows: "none",
    responsive: "standard",
    download: false,
    print: false,
    search: false,
    viewColumns: false,
    rowsPerPage: data.length,
    rowsPerPageOptions: [data.length],
    sort: true,
    pagination: false,
    fixedHeader: true, // ヘッダー行を固定
    fixedSelectColumn: true, // 固定する列がある場合に使用
    tableBodyMaxHeight: "300px", // テーブル本体の最大高さを指定
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

export default Table2;


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
