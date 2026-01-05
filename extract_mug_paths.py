#!/usr/bin/env python3
"""
Script per estrarre i paths SVG dal file MUG FULL.txt
organizzandoli per sezione (schiuma, liquido, tacchette, vetro)
"""

import re
import json

# Leggi il contenuto dal file MUG FULL.txt
# Il file è sul Desktop dell'utente
file_path = r"C:\Users\Clore\Desktop\MUG FULL.txt"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern per estrarre tutti i path con i loro attributi
path_pattern = r'<path\s+([^>]+)d="([^"]+)"[^>]*/?>|<path\s+d="([^"]+)"([^>]*)/?>'

# Categorie di paths
schiuma_paths = []
liquido_paths = []
tacchette_paths = []
glass_paths = []

# Pattern per estrarre attributi
def extract_attrs(attrs_str):
    """Estrae fill e data-section dagli attributi"""
    fill_match = re.search(r'fill="([^"]+)"', attrs_str)
    section_match = re.search(r'data-section="([^"]+)"', attrs_str)
    opacity_match = re.search(r'opacity="([^"]+)"', attrs_str)
    
    return {
        'fill': fill_match.group(1) if fill_match else '#000000',
        'section': section_match.group(1) if section_match else None,
        'opacity': float(opacity_match.group(1)) if opacity_match else 1.0
    }

# Trova tutti i path
for match in re.finditer(r'<path\s+([^>]*)d="\s*([^"]+)"', content, re.DOTALL):
    attrs_str = match.group(1)
    d = match.group(2).strip().replace('\n', ' ').replace('\t', ' ')
    d = re.sub(r'\s+', ' ', d)  # Normalizza spazi
    
    attrs = extract_attrs(attrs_str)
    
    path_obj = {
        'd': d,
        'fill': attrs['fill']
    }
    
    # Categorizza in base a data-section o colore
    section = attrs.get('section')
    fill = attrs['fill'].upper()
    
    if section == 'schiuma_beige' or fill in ['#F7EFC1', '#EDD9A4', '#F7F2CC', '#FBF7E1', '#F7EABA', '#FAEEBF', '#F9EFC3']:
        schiuma_paths.append(path_obj)
    elif section == 'liquido_arancione' or fill in ['#E58B06', '#E38905', '#E89106', '#EA9607', '#EA950D', '#EA9A26', '#EB990C', '#ED9C10', '#ED9D0D', '#EFA20B', '#EFA612', '#F2C848', '#F3B323', '#F5BD35', '#F5C335', '#D57005', '#D77608']:
        liquido_paths.append(path_obj)
    elif section == 'tacchette_rosse' or fill in ['#951D08', '#FF0000', '#CC0000']:
        tacchette_paths.append(path_obj)
    else:
        # Colori vetro tipici
        if fill in ['#FDFDFD', '#C6D8D7', '#CADCDA', '#C1D4D2', '#90ACAD', '#9BB3B5', '#94AEB0', '#AAC4C3', '#A3BCBD', '#B2CBC9', '#C2D6D5', '#C7DAD9', '#E9F4EC']:
            glass_paths.append(path_obj)
        else:
            # Default: aggiungi al vetro se non riconosciuto
            glass_paths.append(path_obj)

# Estrai viewBox
viewbox_match = re.search(r'viewBox="([^"]+)"', content)
viewbox = viewbox_match.group(1) if viewbox_match else "0 0 1696 2528"

# Genera il file TypeScript
output = f'''// Generated from MUG FULL.txt
// Do not edit manually

export const MUG_VIEWBOX = "{viewbox}";

// Paths del vetro del boccale (sfondo + fronte)
export const GLASS_PATHS = {json.dumps(glass_paths[:20], indent=2)};

// Paths del liquido arancione (birra)
export const LIQUID_PATHS = {json.dumps(liquido_paths[:50], indent=2)};

// Paths della schiuma beige
export const FOAM_PATHS = {json.dumps(schiuma_paths[:30], indent=2)};

// Paths delle tacchette rosse (indicatori livello)
export const NOTCH_PATHS = {json.dumps(tacchette_paths, indent=2)};

// Stats
// Glass paths: {len(glass_paths)}
// Liquid paths: {len(liquido_paths)}
// Foam paths: {len(schiuma_paths)}
// Notch paths: {len(tacchette_paths)}
'''

# Salva il file TypeScript
output_path = r"C:\Users\Clore\Sviluppo\Stappa\components\BeerMugPathsNew.ts"
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(output)

print(f"ViewBox: {viewbox}")
print(f"Glass paths: {len(glass_paths)}")
print(f"Liquid paths: {len(liquido_paths)}")
print(f"Foam paths: {len(schiuma_paths)}")
print(f"Notch paths: {len(tacchette_paths)}")
print(f"\nFile salvato in: {output_path}")
