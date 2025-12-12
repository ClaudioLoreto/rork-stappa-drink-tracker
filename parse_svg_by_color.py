import re
import json

def parse_svg_paths(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Regex to find paths and their fill colors
    # Looking for <path ... fill="..." ... d="..." ... />
    # Note: attributes can be in any order.
    
    path_pattern = re.compile(r'<path\s+([^>]+)>')
    fill_pattern = re.compile(r'fill="([^"]+)"')
    d_pattern = re.compile(r'd="([^"]+)"', re.DOTALL)

    paths_by_color = {}

    for match in path_pattern.finditer(content):
        attrs = match.group(1)
        fill_match = fill_pattern.search(attrs)
        d_match = d_pattern.search(attrs)

        if fill_match and d_match:
            fill = fill_match.group(1)
            d = d_match.group(1).replace('\n', ' ').replace('\t', ' ').strip()
            
            # Normalize color to uppercase
            fill = fill.upper()

            if fill not in paths_by_color:
                paths_by_color[fill] = []
            paths_by_color[fill].append(d)

    return paths_by_color

file_path = 'temp-svg.txt'
paths = parse_svg_paths(file_path)

# Print summary
print(f"Found {len(paths)} unique colors.")
for color, path_list in paths.items():
    print(f"Color: {color}, Count: {len(path_list)}")
    # Print first few chars of first path to verify
    # print(f"  Sample: {path_list[0][:50]}...")

# Save to json for inspection if needed
with open('parsed_paths.json', 'w') as f:
    json.dump(paths, f, indent=2)
