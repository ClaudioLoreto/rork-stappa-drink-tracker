import re
import os

input_file = "BEER-MUG-PERFETTO.txt"
output_file = "components/BeerMugPaths.ts"

def parse_svg_text(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    sections = {}
    current_section = None
    
    # Regex to find section markers like <!-- [SECTION_NAME] -->
    # and paths
    
    # Split by comments
    parts = re.split(r'<!--\s*\[(.*?)\]\s*-->', content)
    
    # parts[0] is header/glass path usually if it's before the first comment
    # parts[1] is section name
    # parts[2] is content
    # ...
    
    # The first part might contain the glass path if it's not marked
    # In the file, the glass path is before [SCHIUMA_BEIGE_1]
    # But wait, the file starts with header comments, then the glass path, then [SCHIUMA_BEIGE_1]
    
    # Let's look at the structure again.
    # Header
    # <path ... VETRO ... />
    # <!-- [SCHIUMA_BEIGE_1] -->
    # ...
    
    # So the first path is VETRO_BOCCALE (implicit)
    
    glass_path_match = re.search(r'<path[^>]*d="([^"]+)"', parts[0], re.DOTALL)
    if glass_path_match:
        sections['VETRO_BOCCALE'] = [glass_path_match.group(1).replace('\n', ' ').replace('\t', '')]
    
    for i in range(1, len(parts), 2):
        section_name = parts[i]
        section_content = parts[i+1]
        
        # Extract all paths in this section
        paths = []
        for match in re.finditer(r'<path[^>]*d="([^"]+)"', section_content, re.DOTALL):
            # Clean up the path data (remove newlines and tabs)
            clean_path = match.group(1).replace('\n', ' ').replace('\t', '')
            # Remove extra spaces
            clean_path = re.sub(r'\s+', ' ', clean_path).strip()
            
            # Also extract fill color if present
            fill_match = re.search(r'fill="([^"]+)"', match.group(0))
            fill = fill_match.group(1) if fill_match else "#000000"
            
            paths.append({'d': clean_path, 'fill': fill})
            
        # Group by base name (e.g. LIQUIDO_ARANCIONE_1 -> LIQUIDO_ARANCIONE)
        base_name = section_name.rsplit('_', 1)[0]
        if base_name not in sections:
            sections[base_name] = []
        
        sections[base_name].extend(paths)

    return sections

def generate_ts_file(sections, output_path):
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("// Auto-generated from BEER-MUG-PERFETTO.txt\n\n")
        
        for name, paths in sections.items():
            f.write(f"export const {name}_PATHS = [\n")
            for p in paths:
                if isinstance(p, dict):
                    f.write(f"  {{ d: \"{p['d']}\", fill: \"{p['fill']}\" }},\n")
                else:
                    # For VETRO_BOCCALE which I stored as string initially
                    f.write(f"  {{ d: \"{p}\", fill: \"#FDFDFD\" }},\n")
            f.write("];\n\n")

if __name__ == "__main__":
    if os.path.exists(input_file):
        sections = parse_svg_text(input_file)
        generate_ts_file(sections, output_file)
        print(f"Generated {output_file}")
    else:
        print(f"File {input_file} not found")
