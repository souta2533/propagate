import React from "react";
import MUIDataTable from "mui-datatables";

const Table = ({ data, dataKey }) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.error("Invalid or empty data format");
    return null;
  }

  // `date`列と`dataKey`で指定された列を表示
  const columns = [
    { name: "query", label: dataKey }, // 1列目は常に`date`
    { name: "count", label: "Count" }, // 2列目は`dataKey`で指定された列
  ];

  // データをテーブル用に整形
  const tableData = data.map((item) => {
    const row = {
      query: item[0],
      count: item[1],
    };
    console.log(row);
    return row;
  });

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
      title={dataKey}
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
