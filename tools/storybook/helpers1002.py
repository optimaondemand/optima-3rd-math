# shared SVG helpers (from make_1001.py)
DCOL = {1:'#0E1C42',2:'#6B46C1',3:'#B05E09',4:'#8A6A00',5:'#4E7A1A',6:'#2F6FDE',7:'#B03A2E',8:'#A23B8C',9:'#2E7D6B',10:'#117E7E',11:'#8C2F6E',12:'#5B6478'}
def strips(rows, W=600, label=True, aria=''):
    # rows: list of (shaded, parts); one strip per row, same length; fraction label at right
    h = 46*len(rows)+12; out = ['<svg viewBox="0 0 %d %d" role="img" aria-label="%s" style="display:block;width:100%%;max-width:%dpx">' % (W+80, h, aria, W+80)]
    for r,(k,n) in enumerate(rows):
        y = 6+46*r; w = (W-10)/n; c = DCOL[n]
        for i in range(n):
            out.append('<rect x="%.1f" y="%d" width="%.1f" height="34" fill="%s" stroke="%s" stroke-width="2"/>' % (10+i*w, y, w, c if i<k else '#fff', c))
        if label:
            out.append('<text x="%d" y="%d" text-anchor="middle" font-size="14" font-weight="900" fill="%s">%d</text><line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="2"/><text x="%d" y="%d" text-anchor="middle" font-size="14" font-weight="900" fill="%s">%d</text>' % (W+40, y+12, c, k, W+32, y+17, W+48, y+17, c, W+40, y+32, c, n))
    k0,n0 = rows[0]; gx = 10+(W-10)*k0/n0
    out.append('<line x1="%.1f" y1="2" x2="%.1f" y2="%d" stroke="#C9A227" stroke-width="3" stroke-dasharray="5 4"/>' % (gx, gx, h-2))
    out.append('</svg>'); return ''.join(out)
def fr(a,b): return '<span class="fr"><span>%s</span><span>%s</span></span>' % (a,b)
def lines(n1, n2, k1, k2, W=600):
    out=['<svg viewBox="0 0 %d 170" role="img" aria-label="Two number lines from 0 to 1, one in %ss and one in %ss. A dot at %d out of %d on the top line and %d out of %d on the bottom line land on the same spot." style="display:block;width:100%%;max-width:%dpx">' % (W+40, 'fifth' if n1==5 else str(n1), 'tenth' if n2==10 else str(n2), k1,n1,k2,n2, W+40)]
    for r,(n,k) in enumerate(((n1,k1),(n2,k2))):
        y=40+80*r; c=DCOL[n]
        out.append('<line x1="20" y1="%d" x2="%d" y2="%d" stroke="#1F2A44" stroke-width="3" stroke-linecap="round"/>' % (y, W+20, y))
        for q in range(n+1):
            x=20+q*W/n; big = q in (0,n)
            out.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="%s" stroke-width="%s"/>' % (x, y-(13 if big else 9), x, y+(13 if big else 9), '#1F2A44' if big else c, 3 if big else 2.5))
        out.append('<text x="20" y="%d" text-anchor="middle" font-size="16" font-weight="900" fill="#1F2A44">0</text><text x="%d" y="%d" text-anchor="middle" font-size="16" font-weight="900" fill="#1F2A44">1</text>' % (y+34, W+20, y+34))
        x=20+k*W/n
        out.append('<circle cx="%.1f" cy="%d" r="9" fill="#1E7A4C" stroke="#fff" stroke-width="3"/><text x="%.1f" y="%d" text-anchor="middle" font-size="14" font-weight="900" fill="#1E7A4C">%d</text><line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="#1E7A4C" stroke-width="2"/><text x="%.1f" y="%d" text-anchor="middle" font-size="14" font-weight="900" fill="#1E7A4C">%d</text>' % (x, y, x, y+30, k, x-8, y+35, x+8, y+35, x, y+51, n))
    x=20+k1*W/n1; out.append('<line x1="%.1f" y1="44" x2="%.1f" y2="116" stroke="#C9A227" stroke-width="2" stroke-dasharray="5 5"/>' % (x,x))
    out.append('</svg>'); return ''.join(out)

