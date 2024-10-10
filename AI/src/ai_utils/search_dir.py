import os 


def load_latest_checkpoint(model_dir):
    checkpoint_dirs = [d for d in os.listdir(model_dir) if d.startswith('checkpoint0')]
    if not checkpoint_dirs:
        raise ValueError('No checkpoints found: {}'.format(model_dir))
    
    latest_checkpoint = checkpoint_dirs.sort(key=lambda x: int(x.split('-')[-1]))[-1]
    checkpoint_path = os.apth.join(model_dir, latest_checkpoint)

    return checkpoint_path