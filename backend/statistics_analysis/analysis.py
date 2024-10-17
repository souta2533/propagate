from fastapi.security import HTTPBearer
from logging import getLogger
import pandas as pd

from db.supabase_client import supabase
from db.db_operations import AnalyticsData, SearchConsoleDataTable, AnalyticsDataTable
from utils.data_process import data_by_date, transform_for_statistic_analysis
from statistics_analysis.correlation_analysis import CorrelationAnalysis
from statistics_analysis.regression_analysis import RegressionAnalysis
from statistics_analysis.time_series_analysis import TimeSeriesAnalysis
from statistics_analysis.variance_analysis import VarianceAnalysis


security = HTTPBearer()    # JWT認証用のセキュリティ設定
logger = getLogger(__name__)

class StatisticsAnalysisData:
    """
        Analytics DataとSearch Console Dataを統計解析するクラス
    """
    def __init__(self, supabase):
        self.supabase = supabase
        self.analytics_data = None
        self.search_console_data = None
        self.data_by_day = None

    async def add_data(self, property_id, start_date, end_date, jwt_token):
        # データを取得
        analytics_data_table = AnalyticsDataTable(self.supabase)
        self.data_by_date = await analytics_data_table.fetch_data(property_id, start_date, end_date, jwt_token)

    def calc_data_by_day(self):
        """
            日付ごとのデータを取得
            data_by_date[base_url] = {
                "PV": 0,
                "CV": 0,
                "CVR": 0.0,
                "active_users": 0,
                "UU": 0,
                "engaged_sessions": 0,
                "total_users": 0,
                "city": defaultdict(int),       # Analytics Dataから取得
                "device_category": defaultdict(int),
                "query": defaultdict(int),
                "click": 0,                    
                "impression": 0,
                "ctr": 0,
                "position": 0,
                "country": defaultdict(int),
            }
        """
        self.data_by_day = data_by_date(self.analytics_data, self.search_console_data)

    def perform_analysis(self, data_by_day=None):
        if self.data_by_day is None and data_by_day is None:
            logger.error("[Static Analytics] data_by_day is None")
            return
        elif data_by_day is not None:
            self.data_by_day = data_by_day  

        # データが空であるかを確認
        if self.data_by_day.empty:
            logger.error("[Static Analytics] data_by_day is empty")
            return None

        # NaNを0に変換
        self.data_by_day.fillna(0, inplace=True)  
        self.data_by_day = self.data_by_day.infer_objects()

        # データが最低2行以上あるかを確認
        if len(self.data_by_day) < 2:
            logger.error("[Static Analytics] Insufficient data for analysis (requires at least 2 rows)")
            return None
        
        # データが最低2行以上あり、かつユニークな値が2つ以上あるか確認
        if len(self.data_by_day) < 2 or len(self.data_by_day['PV'].unique()) < 2:
            logger.error("[Static Analytics] Insufficient data or not enough unique data points for analysis")
            return None

        # 標準偏差がゼロでないか確認
        if self.data_by_day['PV'].std() == 0 or self.data_by_day['CV'].std() == 0:
            logger.error("[Static Analytics] Standard deviation is zero, cannot perform correlation calculation")
            return None

        # 相関解析
        correlation_results_PV_CV = CorrelationAnalysis.calculate(self.data_by_day['PV'], self.data_by_day['CV'])
        correlation_results_click_CV = CorrelationAnalysis.calculate(self.data_by_day['click'], self.data_by_day['CV'])

        # 単回帰分析
        regression_results_PV_CV = RegressionAnalysis.simple_regression(self.data_by_day['PV'], self.data_by_day['CV'])         # PVが100増えた時のCVの増加
        regression_results_click_CV = RegressionAnalysis.simple_regression(self.data_by_day['click'], self.data_by_day['CV'])   # clickが100増えた時のCVの増加

        # 重回帰分析
        multiple_regression_results_PV_UU_CV = RegressionAnalysis.multiple_regression(self.data_by_day[['PV', 'UU']], self.data_by_day['CV'])
        multiple_regression_results_click_impression_CV = RegressionAnalysis.multiple_regression(self.data_by_day[['click', 'impression']], self.data_by_day['CV'])

        # 時系列解析
        # time_series_results_CVR = TimeSeriesAnalysis.analyze(self.data_by_day['CVR'], self.data_by_day['date'])
        # time_series_results_click_CVR = TimeSeriesAnalysis.analyze(self.data_by_day['CVR'], self.data_by_day['date'])

        # 分散解析
        variance_results_device_CVR = VarianceAnalysis.analyze(groups=self.data_by_day['device_category'], target=self.data_by_day['CVR'])
        variance_results_query_CVR = VarianceAnalysis.analyze(groups=self.data_by_day['query'], target=self.data_by_day['CVR'])

        # 解析結果を辞書としてまとめて返す
        results = {
            'correlation_results_PV_CV': correlation_results_PV_CV,     
            'correlation_results_click_CV': correlation_results_click_CV,
            'regression_results_PV_CV': regression_results_PV_CV,
            'regression_results_click_CV': regression_results_click_CV,
            'multiple_regression_results_PV_UU_CV': multiple_regression_results_PV_UU_CV,
            'multiple_regression_results_click_impression_CV': multiple_regression_results_click_impression_CV,
            'variance_results_device_CVR': variance_results_device_CVR,
            'variance_results_query_CVR': variance_results_query_CVR
        }

        return results

async def main():
    propertyId = '359877627'
    startDate = '2024-09-01'
    endDate = '2024-09-30'
    jwt_token = 'testJwtToken'

    # DBからデータを取得
    analytics_table = AnalyticsData(supabase)
    analytics_data = await analytics_table.fetch_data(propertyId, startDate, endDate, jwt_token)

    search_console_table = SearchConsoleDataTable(supabase)
    search_console_data = await search_console_table.fetch_data(propertyId, startDate, endDate, jwt_token)

    data_by_day = data_by_date(analytics_data, search_console_data)
    transformed_data_by_day = transform_for_statistic_analysis(data_by_day)
    df = pd.DataFrame(transformed_data_by_day)

    analysis = StatisticsAnalysisData(supabase)
    results = analysis.perform_analysis(data_by_day=df[df['base_url'] == 'https://www.propagateinc.com'])
    for k, v in results.items():
        print(f"{k}: {v}")

    prompt = Prompt()
    prompt_for_issues = prompt.create_prompt_for_issues(
        format_path='AI/static/analysis_format.txt',
        user_info={
            'industry': 'Web運用',
            'goal': 'CVR向上',
            'website_overview': 'Web運用のためのWebサイト'
        },
        result_of_analysis=results
    )
    print(f"Prompt for issues: {prompt_for_issues}")


if __name__ == "__main__":
    from asyncio import run
    run(main())