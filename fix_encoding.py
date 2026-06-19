import os

file_path = r'c:\Smart Fusion\Slot 3\Batch D\Stilt Walking & Stunt Entertainment\assets\css\style.css'

with open(file_path, 'rb') as f:
    content = f.read()

# Try to detect and fix UTF-16 with BOM or null bytes
if b'\xff\xfe' in content[:2] or b'\x00' in content:
    print("Detected encoding issue, fixing...")
    try:
        # Decode as UTF-16 and re-encode as UTF-8
        decoded = content.decode('utf-16')
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(decoded)
        print("Fixed UTF-16 encoding.")
    except Exception as e:
        print(f"Error fixing encoding: {e}")
        # Alternative: just strip null bytes if it's not actually UTF-16
        fixed = content.replace(b'\x00', b'')
        with open(file_path, 'wb') as f:
            f.write(fixed)
        print("Stripped null bytes.")
else:
    print("Encoding seems fine or unknown.")
