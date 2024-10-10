import pandas as pd


class TimeSeriesAnalysis:
    @staticmethod
    def analyze(values, dates):
        # 日付を解析
        parsed_dates = pd.to_datetime(dates, errors='coerce')

        # dates と values を一度データフレームにしてソートする
        df = pd.DataFrame({'date': parsed_dates, 'value': values}).sort_values('date')

        # ソート後のデータで時系列データを作成
        ts_data = pd.Series(df['value'].values, index=df['date'])

        # 欠損値を確認
        missing_count = ts_data.isnull().sum()
        if missing_count > 0:
            print(f"Missing values: {missing_count}")
            ts_data = ts_data.fillna(ts_data.mean())
        
        # 移動平均の計算（必要に応じて）
        moving_avg = ts_data.rolling(window=7, min_periods=1).mean()
        return moving_avg
