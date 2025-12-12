import re
import json

def parse_svg_text(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split by comments to identify sections
    # We want to preserve the order but group them.
    
    # Regex to find paths and their preceding comments if any
    # But the structure seems to be:
    # <path ... />
    # <!-- [TAG] -->
    # <path ... />
    
    # Let's iterate line by line or use a state machine approach.
    
    lines = content.split('\n')
    
    sections = {
        'mug': [],
        'liquid': [],
        'foam': []
    }
    
    current_tag = 'mug' # Default to mug (static parts)
    
    path_pattern = re.compile(r'<path\s+([^>]+)\s*/>|<path\s+([^>]+)\s*>\s*</path>', re.DOTALL)
    
    # We will reconstruct the file content to match against regex or just parse line by line looking for <path and comments
    
    # Better approach: split the content by tags.
    # The tags are <!-- [LIQUIDO_ARANCIONE] --> and <!-- [SCHIUMA_BORDO] -->
    
    # Let's normalize the content first (remove newlines inside tags if possible, but SVG paths are multiline)
    
    # Let's try to find all occurrences of comments and their positions.
    
    # Find all tags
    tag_matches = list(re.finditer(r'<!--\s*\[([^\]]+)\]\s*-->', content))
    
    # We have start and end indices of tags.
    # Everything before the first tag is 'mug'.
    # Then we switch context based on the tag.
    
    last_pos = 0
    current_context = 'mug'
    
    for match in tag_matches:
        tag_text = match.group(1)
        start, end = match.span()
        
        # Process text between last_pos and start
        chunk = content[last_pos:start]
        extract_paths(chunk, current_context, sections)
        
        # Update context
        if 'LIQUIDO_ARANCIONE' in tag_text:
            current_context = 'liquid'
        elif 'SCHIUMA_BORDO' in tag_text:
            current_context = 'foam'
        else:
            current_context = 'mug' # Unknown tag, maybe treat as static?
            
        last_pos = end
        
    # Process remaining text
    chunk = content[last_pos:]
    extract_paths(chunk, current_context, sections)
    
    return sections

def extract_paths(text, context, sections):
    # Find all path definitions
    # A path looks like <path ... d="..." ... /> or <path ... d="..."> ... </path>
    # We mainly care about the 'd' attribute and maybe 'fill'/'opacity' if we want to reproduce it exactly.
    # The user said "1 to 1", so we should probably keep the fill colors if they are important, 
    # OR we might override them in the component.
    # For now, let's extract the full props or at least d and fill.
    
    # Regex for <path ... />
    # We need to handle multiline.
    
    # Let's find all <path ... /> blocks.
    path_regex = re.compile(r'<path\s+(.*?)/>', re.DOTALL)
    matches = path_regex.findall(text)
    
    for match in matches:
        # Extract d attribute
        d_match = re.search(r'd="([^"]+)"', match, re.DOTALL)
        fill_match = re.search(r'fill="([^"]+)"', match)
        opacity_match = re.search(r'opacity="([^"]+)"', match)
        
        if d_match:
            d = d_match.group(1).replace('\n', ' ').strip()
            # Clean up multiple spaces
            d = re.sub(r'\s+', ' ', d)
            
            path_data = {
                'd': d,
                'fill': fill_match.group(1) if fill_match else None,
                'opacity': opacity_match.group(1) if opacity_match else None
            }
            sections[context].append(path_data)

sections = parse_svg_text('MUG_DI_PARTENZA.txt')

# Generate TypeScript file content
ts_content = """export interface PathData {
  d: string;
  fill?: string;
  opacity?: string;
}

export const MUG_PATHS: PathData[] = [
"""

for p in sections['mug']:
    ts_content += f"  {{ d: '{p['d']}', fill: '{p['fill']}', opacity: '{p['opacity']}' }},\n"
ts_content += "];\n\n"

ts_content += "export const LIQUID_PATHS: PathData[] = [\n"
for p in sections['liquid']:
    ts_content += f"  {{ d: '{p['d']}', fill: '{p['fill']}', opacity: '{p['opacity']}' }},\n"
ts_content += "];\n\n"

ts_content += "export const FOAM_PATHS: PathData[] = [\n"
for p in sections['foam']:
    ts_content += f"  {{ d: '{p['d']}', fill: '{p['fill']}', opacity: '{p['opacity']}' }},\n"
ts_content += "];\n"

with open('components/BeerMugPaths.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print("Successfully generated components/BeerMugPaths.ts")
