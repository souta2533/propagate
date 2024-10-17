from collections import defaultdict
import scipy.stats as stats


class VarianceAnalysis:
    @staticmethod
    def analyze(groups, target):
        """
            一元配置分散分析: 複数グループの平均に優位な差があるかを検定する手法
            引数:
                groups: グループの配列  groups = ['desktop', 'mobile', 'tablet', etc.]
                target: 検定対象の配列  target = [0.05, 0.07, 0.06, 0.08, 0.06, 0.09]
            戻り値:
                f_value: F値(グループ間の分散とグループ内の分散の比)
                p_value: p値(有意差(0.5以下で有意な差がある))
        """
        # Noneを含むグループを削除し，有効なデータだけにフィルタリング
        valid_data = [(g, t) for g, t in zip(groups, target) if g is not None]

        if len(valid_data) < 2:
            print(valid_data)
            return {"f_value": None, "p_value": None}
        
        filtered_groups, filtered_target = zip(*valid_data)

        group_dict = defaultdict(list)
        for g, t in zip(filtered_groups, filtered_target):
            group_dict[g].append(t)

        kind_of_groupts = list(group_dict.keys())
        data_for_anova = list(group_dict.values())

        if any(len(values) < 2 for values in data_for_anova):
            return {"f_value": None, "p_value": None}

        f_value, p_value = stats.f_oneway(*data_for_anova)
        return {"Kind of groups": kind_of_groupts, "f_value": f_value, "p_value": p_value}