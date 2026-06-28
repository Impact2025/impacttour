import os
from PIL import Image, ImageDraw, ImageFont

base_dir = r"D:\APPS\IctusGo\public\images"
os.makedirs(base_dir, exist_ok=True)

tours = [
    # Blogs (green/sporty theme)
    ("blog-traditioneel", "#00E676", "Teambuilding 2.0", "Waarom GPS wint"),
    ("blog-impact", "#8B5CF6", "Sociale Impact Meten", "GMS Score uitgelegd"),
    ("blog-jeugd", "#F59E0B", "Jeugdtocht", "Buiten spelen 2.0"),
    ("blog-voetbal", "#00C853", "VoetbalMissie", "Meer dan trainen"),
    ("blog-gms", "#EC4899", "Geluksmomenten", "Score methodiek"),
    # KB (blue/teal)
    ("kb-checklist", "#3B82F6", "Checklist", "Teambuildingdag"),
    ("kb-keuze", "#6366F1", "Welke tocht?", "Vergelijking"),
    ("kb-wijktocht", "#14B8A6", "Wijktocht", "Stappenplan"),
    ("kb-faq", "#8B5CF6", "Veelgestelde vragen", "GPS Teambuilding"),
    ("kb-impactrapport", "#0EA5E9", "Impactrapport", "GMS Scores lezen"),
]

def generate(slug, color, title1, title2):
    w, h = 1200, 630
    img = Image.new("RGB", (w, h), (15, 23, 42))  # #0F172A
    draw = ImageDraw.Draw(img)
    
    # Gradient
    for y in range(h):
        a = y / h
        r = int(15 * (1-a) + int(color[1:3], 16) * 0.2 * a)
        g = int(23 * (1-a) + int(color[3:5], 16) * 0.2 * a)
        b = int(42 * (1-a) + int(color[5:7], 16) * 0.2 * a)
        draw.line([(0, y), (w, y)], fill=(r, g, b))
    
    # Accent circle
    cr, cg, cb = int(color[1:3], 16), int(color[3:5], 16), int(color[5:7], 16)
    draw.ellipse([w-180, -80, w+80, 300], outline=(cr, cg, cb, 30), width=2)
    
    try:
        ft = ImageFont.truetype("C:\\Windows\\Fonts\\segoeuib.ttf", 44)
        fs = ImageFont.truetype("C:\\Windows\\Fonts\\segoeuib.ttf", 16)
    except:
        ft = fs = ImageFont.load_default()
    
    draw.text((60, 55), "ICTUSGO", fill=(0, 230, 118, 50), font=fs)
    draw.text((60, 200), title1, fill=(255, 255, 255), font=ft)
    draw.text((60, 260), title2, fill=(148, 163, 184), font=fs)
    
    path = os.path.join(base_dir, f"{slug}.jpg")
    img.save(path, "JPEG", quality=85)
    print(f"  ✅ {slug}.jpg")

print("📸 IctusGo covers:")
for slug, color, t1, t2 in tours:
    generate(slug, color, t1, t2)
print(f"\n✅ {len(tours)} covers gegenereerd!")
