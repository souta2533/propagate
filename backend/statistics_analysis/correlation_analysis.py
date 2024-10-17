import numpy as np


class CorrelationAnalysis:
    @staticmethod
    def calculate(x, y):
        """
            @staticmethod 
                -> インスタンスを生成せずに呼び出せる
                ex) CorrelationAnalysis.calculate(x, y)

            相関係数を計算する
            np.correcoef(x, y) -> [[1, 相関係数],[相関係数, 1]]
        """
        return np.corrcoef(x, y)[0, 1]