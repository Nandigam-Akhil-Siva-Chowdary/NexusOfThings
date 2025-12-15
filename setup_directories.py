# setup_directories.py
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# Directories to create
directories = [
    'static/css',
    'static/js', 
    'static/images',
    'static/videos',
    'staticfiles',
    'media',
    'templates'
]

print("Creating project directories...")
for directory in directories:
    dir_path = BASE_DIR / directory
    os.makedirs(dir_path, exist_ok=True)
    print(f"Created: {dir_path}")

# Create basic CSS file
css_content = """/* static/css/style.css - Basic styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

header {
    background: #333;
    color: white;
    padding: 1rem 0;
}

nav ul {
    display: flex;
    list-style: none;
    gap: 20px;
}

nav a {
    color: white;
    text-decoration: none;
}

section {
    padding: 40px 0;
}

.btn {
    padding: 10px 20px;
    background: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 5px;
}

.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
}

.modal-content {
    background: white;
    padding: 20px;
    margin: 50px auto;
    max-width: 600px;
}"""

css_path = BASE_DIR / 'static/css/style.css'
with open(css_path, 'w') as f:
    f.write(css_content)
print(f"Created: {css_path}")

# Create placeholder files
placeholders = {
    'static/js/script.js': '// JavaScript file for Nexus of Things',
    'static/images/college-logo.png': 'Placeholder for college logo',
    'static/images/poster.png': 'Placeholder for emerging tech image',
    'static/images/iot-background.jpg': 'Placeholder for IoT background',
    'static/videos/iot-background.mp4': 'Placeholder for IoT video'
}

for file_path, content in placeholders.items():
    full_path = BASE_DIR / file_path
    with open(full_path, 'w') as f:
        f.write(content)
    print(f"Created: {full_path}")

print("\n✅ Directory setup complete!")