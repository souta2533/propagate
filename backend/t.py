import json

try:
    with open('output.json', 'r') as file:
        data = json.load(file)
    print("JSON is valid")
except json.JSONDecodeError as e:
    print(f"Invalid JSON: {e}")
