import React, { useState } from "react";
import { Select, SelectTrigger, SelectContent, SelectItem } from "../ui/Select";

const DateRange = ({ setDateRange }) => {
  const [selectedRange, setSelectedRange] = useState("過去7日間");

  const handleRangeChange = (range) => {
    setSelectedRange(range);
    setDateRange(range); // 親コンポーネントに日付範囲を渡す
  };

  return (
    <Select value={selectedRange} onValueChange={handleRangeChange}>
      <SelectTrigger>{selectedRange}</SelectTrigger>
      <SelectContent>
        <SelectItem value="過去7日間">過去7日間</SelectItem>
        <SelectItem value="過去30日間">過去30日間</SelectItem>
        <SelectItem value="過去90日間">過去90日間</SelectItem>
        <SelectItem value="カスタム">カスタム</SelectItem>
        <SelectItem value="n-1月">n-1月</SelectItem>
        <SelectItem value="n-2月">n-2月</SelectItem>
        <SelectItem value="全期間">全期間</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default DateRange;
