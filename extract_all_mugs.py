#!/usr/bin/env python3
"""
Script per estrarre i paths SVG dai 3 file MUG (EMPTY, INTERMEDIATE, FULL)
Crea BeerMugPaths.ts con struttura pulita per ogni fase

Secondo TASK.txt:
- MUG EMPTY.TXT = Fase 1 (mug vuoto)
- MUG.TXT = Fase 2 (riempimento intermedio)
- MUG FULL.TXT = Fase 3 (pieno con schiuma overflow)
"""

import re
import json
import os

# Path base dei file SVG
BASE_PATH = r"C:\Users\Clore\Desktop\mug"

# Files da processare
FILES = {
    'empty': os.path.join(BASE_PATH, 'MUG EMPTY.txt'),
    'intermediate': os.path.join(BASE_PATH, 'MUG .txt'),  # Nota: ha uno spazio
    'full': os.path.join(BASE_PATH, 'MUG FULL.txt')
}

def extract_attrs(attrs_str):
    """Estrae fill, data-section e opacity dagli attributi"""
    fill_match = re.search(r'fill="([^"]+)"', attrs_str)
    section_match = re.search(r'data-section="([^"]+)"', attrs_str)
    opacity_match = re.search(r'opacity="([^"]+)"', attrs_str)
    
    return {
        'fill': fill_match.group(1) if fill_match else '#000000',
        'section': section_match.group(1) if section_match else None,
        'opacity': float(opacity_match.group(1)) if opacity_match else 1.0
    }

def categorize_path(attrs, d):
    """Categorizza un path in base ai suoi attributi"""
    section = attrs.get('section')
    fill = attrs['fill'].upper() if attrs['fill'] else '#000000'
    
    path_obj = {
        'd': d,
        'fill': attrs['fill'],
        'opacity': attrs.get('opacity', 1.0)
    }
    
    # Colori schiuma (beige/crema)
    foam_colors = ['#F7EFC1', '#EDD9A4', '#F7F2CC', '#FBF7E1', '#F7EABA', '#FAEEBF', 
                   '#F9EFC3', '#FFF8DC', '#FFFBE6', '#F5DEB3', '#FAEBD7']
    
    # Colori liquido (arancione/birra)
    liquid_colors = ['#E58B06', '#E38905', '#E89106', '#EA9607', '#EA950D', '#EA9A26', 
                     '#EB990C', '#ED9C10', '#ED9D0D', '#EFA20B', '#EFA612', '#F2C848', 
                     '#F3B323', '#F5BD35', '#F5C335', '#D57005', '#D77608', '#E08206',
                     '#DA7A05', '#CF6D04', '#C46303', '#B85A02', '#FF9500', '#FF8C00']
    
    # Colori tacchette (rosso)
    notch_colors = ['#951D08', '#FF0000', '#CC0000', '#B22222', '#8B0000', '#DC143C']
    
    # Colori vetro (grigi/verdi acqua)
    glass_colors = ['#FDFDFD', '#C6D8D7', '#CADCDA', '#C1D4D2', '#90ACAD', '#9BB3B5', 
                    '#94AEB0', '#AAC4C3', '#A3BCBD', '#B2CBC9', '#C2D6D5', '#C7DAD9', 
                    '#E9F4EC', '#F0F8FF', '#E0EEEE', '#D4E4E4', '#C0D0D0']
    
    if section == 'schiuma_beige' or fill in foam_colors:
        return 'foam', path_obj
    elif section == 'liquido_arancione' or fill in liquid_colors:
        return 'liquid', path_obj
    elif section == 'tacchette_rosse' or fill in notch_colors:
        return 'notch', path_obj
    elif fill in glass_colors or 'glass' in str(section or '').lower():
        return 'glass', path_obj
    else:
        # Default: vetro
        return 'glass', path_obj

def extract_paths_from_file(file_path):
    """Estrae tutti i path da un file SVG"""
    print(f"Processing: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Estrai viewBox
    viewbox_match = re.search(r'viewBox="([^"]+)"', content)
    viewbox = viewbox_match.group(1) if viewbox_match else "0 0 1696 2528"
    
    # Categorie
    categories = {
        'foam': [],
        'liquid': [],
        'notch': [],
        'glass': []
    }
    
    # Pattern per trovare path
    for match in re.finditer(r'<path\s+([^>]*)d="\s*([^"]+)"', content, re.DOTALL):
        attrs_str = match.group(1)
        d = match.group(2).strip().replace('\n', ' ').replace('\t', ' ')
        d = re.sub(r'\s+', ' ', d)  # Normalizza spazi
        
        attrs = extract_attrs(attrs_str)
        category, path_obj = categorize_path(attrs, d)
        categories[category].append(path_obj)
    
    return viewbox, categories

def main():
    print("=" * 60)
    print("EXTRACTING MUG PATHS FROM SVG FILES")
    print("=" * 60)
    
    all_data = {}
    viewbox = None
    
    for phase, file_path in FILES.items():
        if not os.path.exists(file_path):
            print(f"ERROR: File not found: {file_path}")
            continue
            
        vb, categories = extract_paths_from_file(file_path)
        viewbox = vb  # Use last viewbox
        all_data[phase] = categories
        
        print(f"\n{phase.upper()}:")
        for cat, paths in categories.items():
            print(f"  {cat}: {len(paths)} paths")
    
    # Genera TypeScript output
    print("\n" + "=" * 60)
    print("GENERATING TYPESCRIPT FILE")
    print("=" * 60)
    
    output_path = r"C:\Users\Clore\Sviluppo\Stappa\components\BeerMugPaths.ts"
    
    ts_content = f'''/**
 * BeerMugPaths.ts
 * Auto-generated from SVG files in C:\\Users\\Clore\\Desktop\\mug
 * 
 * Struttura secondo TASK.txt:
 * - PHASE_EMPTY: Mug vuoto (MUG EMPTY.txt)
 * - PHASE_FILLING: Mug in riempimento (MUG .txt) 
 * - PHASE_FULL: Mug pieno con schiuma overflow (MUG FULL.txt)
 * 
 * Ogni fase contiene:
 * - glass: paths del vetro del boccale
 * - liquid: paths del liquido arancione (birra)
 * - foam: paths della schiuma beige
 * - notch: paths delle tacchette rosse (indicatori livello)
 */

export const MUG_VIEWBOX = "{viewbox}";

export interface MugPath {{
  d: string;
  fill: string;
  opacity?: number;
}}

export interface MugPhase {{
  glass: MugPath[];
  liquid: MugPath[];
  foam: MugPath[];
  notch: MugPath[];
}}

// ============================================================
// FASE 1: MUG VUOTO (Empty)
// ============================================================
export const PHASE_EMPTY: MugPhase = {{
  glass: {json.dumps(all_data.get('empty', {}).get('glass', []), indent=2)},
  liquid: {json.dumps(all_data.get('empty', {}).get('liquid', []), indent=2)},
  foam: {json.dumps(all_data.get('empty', {}).get('foam', []), indent=2)},
  notch: {json.dumps(all_data.get('empty', {}).get('notch', []), indent=2)}
}};

// ============================================================
// FASE 2: MUG IN RIEMPIMENTO (Filling)
// ============================================================
export const PHASE_FILLING: MugPhase = {{
  glass: {json.dumps(all_data.get('intermediate', {}).get('glass', []), indent=2)},
  liquid: {json.dumps(all_data.get('intermediate', {}).get('liquid', []), indent=2)},
  foam: {json.dumps(all_data.get('intermediate', {}).get('foam', []), indent=2)},
  notch: {json.dumps(all_data.get('intermediate', {}).get('notch', []), indent=2)}
}};

// ============================================================
// FASE 3: MUG PIENO CON OVERFLOW (Full)
// ============================================================
export const PHASE_FULL: MugPhase = {{
  glass: {json.dumps(all_data.get('full', {}).get('glass', []), indent=2)},
  liquid: {json.dumps(all_data.get('full', {}).get('liquid', []), indent=2)},
  foam: {json.dumps(all_data.get('full', {}).get('foam', []), indent=2)},
  notch: {json.dumps(all_data.get('full', {}).get('notch', []), indent=2)}
}};

// ============================================================
// STATISTICHE
// ============================================================
/*
EMPTY PHASE:
  - Glass: {len(all_data.get('empty', {}).get('glass', []))} paths
  - Liquid: {len(all_data.get('empty', {}).get('liquid', []))} paths
  - Foam: {len(all_data.get('empty', {}).get('foam', []))} paths
  - Notch: {len(all_data.get('empty', {}).get('notch', []))} paths

FILLING PHASE:
  - Glass: {len(all_data.get('intermediate', {}).get('glass', []))} paths
  - Liquid: {len(all_data.get('intermediate', {}).get('liquid', []))} paths
  - Foam: {len(all_data.get('intermediate', {}).get('foam', []))} paths
  - Notch: {len(all_data.get('intermediate', {}).get('notch', []))} paths

FULL PHASE:
  - Glass: {len(all_data.get('full', {}).get('glass', []))} paths
  - Liquid: {len(all_data.get('full', {}).get('liquid', []))} paths
  - Foam: {len(all_data.get('full', {}).get('foam', []))} paths
  - Notch: {len(all_data.get('full', {}).get('notch', []))} paths
*/
'''
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(ts_content)
    
    print(f"\nSaved to: {output_path}")
    print("DONE!")

if __name__ == '__main__':
    main()
