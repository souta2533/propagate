def batch_process(data, batch_size, process_func, *args, **kwargs):
    """
    dataをbatch_sizeごとに処理する関数

    :param data: リストや配列のデータ
    :param batch_size: バッチサイズ
    :param process_func: バッチごとに実行する関数
    :param args: 関数に渡す引数
    :param kwargs: 関数に渡すキーワード引数
    """
    for i in range(0, len(data), batch_size):
        print(f"Processing batch {i + 1} to {i + batch_size}")
        process_func(data[i:i + batch_size], *args, **kwargs)
