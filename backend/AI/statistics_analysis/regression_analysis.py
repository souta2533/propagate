import matplotlib.pyplot as plt
import numpy as np
from sklearn.linear_model import LinearRegression


class RegressionAnalysis:
    @staticmethod
    def simple_regression(x, y):
        """
            @staticmethod 
                -> インスタンスを生成せずに呼び出せる
                ex) RegressionAnalysis.simple_regression(x, y)

            単回帰分析を行う
            x: 独立変数
            y: 従属変数
        """
        x = np.array(x).reshape(-1, 1)  # -1: 自動的に次元を設定, 1: 列の数 ex) [1, 2, 3] -> [[1], [2], [3]]
        y = np.array(y)
        model = LinearRegression().fit(x, y)
        return model.coef_[0] * 100     # 100単位あたりの増加
    
    @staticmethod
    def multiple_regression(X, y):
        """
           重回帰分析: どの変数が目的変数に影響を与えているかを調べる 
        """
        model = LinearRegression().fit(X, y)
        return model.coef_      # 各変数の係数

    @staticmethod
    def plot_regression(x, y):
        """
            回帰直線をプロットする
        """
        x = np.array(x).reshape(-1, 1)
        y = np.array(y)
        model = LinearRegression().fit(x, y)

        # 回帰直線の係数と切片を取得
        slope = model.coef_[0]
        intercept = model.intercept_

        # 回帰直線のプロット
        plt.figure(figsize=(10, 6))
        plt.scatter(x, y, color='blue')
        plt.plot(x, slope * x + intercept, color='red')

        plt.xlabel('click')
        plt.ylabel('CV')
        plt.legend(['Regression line', 'Data'])
        plt.title('Regression Analysis')
        plt.savefig(f"AI/static/regression_analysis_click_CV_Sep.png")