import os, re

def fix_imports(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    def repl(m):
        path = m.group(1)
        if path.startswith('.') and not path.endswith('.js'):
            return f"from '{path}.js'"
        return f"from '{path}'"
    
    new_content = re.sub(r"from\s+'([^']+)'", repl, content)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Fixed {file_path}')

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.ts'):
            fix_imports(os.path.join(root, file))
