class Prompt:
    """
        LLMへの入力するためのpromptを生成するクラス
    """
    def __init__(self):
        self.prompt = None

    def create_prompt_for_issues(self, format_path, user_info, result_of_analysis):
        """
            統計解析の結果をもとに, LLMへの入力するpromptを生成
            user_info: ユーザー情報(業界, 目的, Webサイトの概要)
        """
        with open(format_path, 'r') as f:
            prompt_format = f.read()  

        # フォーマットにデータを挿入
        self.prompt = prompt_format.format(
            industry=user_info['industry'],
            goal=user_info['goal'],
            website_overview=user_info['website_overview'],
            correlation_results_PV_CV=result_of_analysis['correlation_results_PV_CV'],
            correlation_results_click_CV=result_of_analysis['correlation_results_click_CV'],
            regression_results_PV_CV=result_of_analysis['regression_results_PV_CV'],
            regression_results_click_CV=result_of_analysis['regression_results_click_CV'],
            multiple_regression_results_PV_UU_CV=result_of_analysis['multiple_regression_results_PV_UU_CV'],
            multiple_regression_results_click_impression_CV=result_of_analysis['multiple_regression_results_click_impression_CV'],
            variance_results_device_f_value=result_of_analysis['variance_results_device_CVR']['f_value'],
            variance_results_device_p_value=result_of_analysis['variance_results_device_CVR']['p_value'],
            variance_results_query_f_value=result_of_analysis['variance_results_query_CVR']['f_value'],
            variance_results_query_p_value=result_of_analysis['variance_results_query_CVR']['p_value']
        )
        return self.prompt