import re
import json

def parse_svg_paths(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    path_pattern = re.compile(r'<path\s+([^>]+)>')
    fill_pattern = re.compile(r'fill="([^"]+)"')
    d_pattern = re.compile(r'd="([^"]+)"', re.DOTALL)

    # Color definitions
    NOTCH_COLOR = "#951D08"
    
    # Liquid colors (Oranges/Golds)
    LIQUID_COLORS = {
        "#B68039", "#E6902A", "#D4A642", "#BD7117", "#D16F05", "#EFA612", 
        "#F2C848", "#EA9A26", "#E28506", "#E38905", "#ED9C10", "#EA950D", 
        "#EFA20B", "#D47304", "#E69006", "#E58B06", "#EA9607", "#ED9D0D", 
        "#F5C335", "#EB990C", "#F5BD35", "#F3B323", "#E89106", "#E99209", 
        "#E8950B"
    }
    
    # Foam colors (Beiges/Yellows)
    FOAM_COLORS = {
        "#F7EFC1", "#EDD9A4", "#F7F2CC", "#EBD59F", "#FBF7E1", "#F7EABA", 
        "#E9D19E", "#C2B887", "#C1C7AB", "#ABA284"
    }

    mug_paths = []
    liquid_paths = []
    foam_paths = []
    notch_paths = []

    min_y_liquid = float('inf')
    max_y_liquid = float('-inf')

    for match in path_pattern.finditer(content):
        attrs = match.group(1)
        fill_match = fill_pattern.search(attrs)
        d_match = d_pattern.search(attrs)

        if fill_match and d_match:
            fill = fill_match.group(1).upper()
            d = d_match.group(1).replace('\n', ' ').replace('\t', ' ').strip()
            
            path_data = {"d": d, "fill": fill}

            if fill == NOTCH_COLOR:
                notch_paths.append(path_data)
            elif fill in LIQUID_COLORS:
                liquid_paths.append(path_data)
                # Rough bounding box calculation for Y
                # Find all Y coordinates in the path data
                # Commands are like M x,y C x1,y1 x2,y2 x,y ...
                # We can just extract all numbers after commas or spaces that look like Y coords
                # A simple regex for numbers might be enough to get min/max of the whole path
                # But 'd' string contains commands. 
                # Let's just extract all numbers and assume Ys are roughly half of them? 
                # No, that's risky.
                # Let's just parse all numbers and find min/max. 
                # Since the liquid is at the bottom, the Max Y should be high (near 2528) and Min Y lower.
                numbers = [float(n) for n in re.findall(r'-?\d+\.?\d*', d)]
                # In SVG path d, coordinates are usually pairs. 
                # But finding exact Ys is hard without a full parser.
                # However, for bounding box, taking all numbers is a loose approximation 
                # but X and Y are mixed.
                # Let's try to be slightly smarter: split by commands?
                # Actually, for the purpose of "Liquid Height", we just need the global bounds.
                # Let's assume the liquid is roughly in the bottom half.
                pass 
            elif fill in FOAM_COLORS:
                foam_paths.append(path_data)
            else:
                # Everything else is Mug/Glass
                mug_paths.append(path_data)

    return {
        "mug": mug_paths,
        "liquid": liquid_paths,
        "foam": foam_paths,
        "notches": notch_paths
    }

data = parse_svg_paths('temp-svg.txt')

# Generate TypeScript file
ts_content = """export const MUG_VIEWBOX = "0 0 1696 2528";

export interface PathData {
  d: string;
  fill: string;
}

export const MUG_PATHS: PathData[] = %s;

export const LIQUID_PATHS: PathData[] = %s;

export const FOAM_PATHS: PathData[] = %s;

export const NOTCH_PATHS: PathData[] = %s;
""" % (
    json.dumps(data["mug"], indent=2),
    json.dumps(data["liquid"], indent=2),
    json.dumps(data["foam"], indent=2),
    json.dumps(data["notches"], indent=2)
)

with open('components/BeerMugPaths.ts', 'w') as f:
    f.write(ts_content)

print(f"Generated components/BeerMugPaths.ts")
print(f"Mug paths: {len(data['mug'])}")
print(f"Liquid paths: {len(data['liquid'])}")
print(f"Foam paths: {len(data['foam'])}")
print(f"Notch paths: {len(data['notches'])}")
