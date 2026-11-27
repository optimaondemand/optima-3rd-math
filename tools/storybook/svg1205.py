import math
NAVY='#0E1C42'; OKG='#1E7A4C'; ORG='#C26A0A'; RED='#B23A2E'
def d(a,b): return math.hypot(a[0]-b[0],a[1]-b[1])
def tick(A,B,n):
    dx,dy=B[0]-A[0],B[1]-A[1]; L=math.hypot(dx,dy); ux,uy=dx/L,dy/L; nx,ny=-uy,ux; m=((A[0]+B[0])/2,(A[1]+B[1])/2); o=''
    for t in range(n):
        off=(t-(n-1)/2)*8
        o+='<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="3.5" stroke-linecap="round"/>'%(m[0]+ux*off-nx*9,m[1]+uy*off-ny*9,m[0]+ux*off+nx*9,m[1]+uy*off+ny*9,NAVY)
    return o
def kind(p,i):
    q=p[i];a=p[i-1];c=p[(i+1)%3];dot=(a[0]-q[0])*(c[0]-q[0])+(a[1]-q[1])*(c[1]-q[1]);cs=dot/(d(a,q)*d(c,q))
    return 'square' if abs(cs)<0.02 else 'smaller' if cs>0 else 'bigger'
def corner(p,i):
    q=p[i];a=p[i-1];c=p[(i+1)%3];k=kind(p,i);u=((a[0]-q[0])/d(a,q),(a[1]-q[1])/d(a,q));v=((c[0]-q[0])/d(c,q),(c[1]-q[1])/d(c,q))
    if k=='square':
        s=13;return '<polyline points="%.1f,%.1f %.1f,%.1f %.1f,%.1f" fill="none" stroke="%s" stroke-width="3"/>'%(q[0]+u[0]*s,q[1]+u[1]*s,q[0]+(u[0]+v[0])*s,q[1]+(u[1]+v[1])*s,q[0]+v[0]*s,q[1]+v[1]*s,OKG)
    r=18;a1=math.atan2(u[1],u[0]);a2=math.atan2(v[1],v[0]);da=a2-a1
    while da>math.pi: da-=2*math.pi
    while da<-math.pi: da+=2*math.pi
    col=ORG if k=='smaller' else RED
    return '<path d="M%.1f %.1f A%d %d 0 0 %d %.1f %.1f" fill="none" stroke="%s" stroke-width="3.5"/>'%(q[0]+r*math.cos(a1),q[1]+r*math.sin(a1),r,r,1 if da>0 else 0,q[0]+r*math.cos(a2),q[1]+r*math.sin(a2),col)
def tri(p,fill='#FBF6EA',stroke=NAVY,marks=None,corners=False):
    o='<polygon points="%s" fill="%s" stroke="%s" stroke-width="4.5" stroke-linejoin="round"/>'%(' '.join('%.1f,%.1f'%q for q in p),fill,stroke)
    if marks:
        for i in range(3): o+=tick(p[i],p[(i+1)%3],marks[i])
    if corners:
        for i in range(3): o+=corner(p,i)
    return o
def label(x,y,t,col=NAVY): return '<text x="%d" y="%d" text-anchor="middle" font-size="17" font-weight="900" fill="%s">%s</text>'%(x,y,col,t)
def arrowsS(A,B,n,col='#C26A0A',flip=False):
    if flip: A,B=B,A
    dx,dy=B[0]-A[0],B[1]-A[1]; L=math.hypot(dx,dy); ux,uy=dx/L,dy/L; nx,ny=-uy,ux; m=((A[0]+B[0])/2+ux*16,(A[1]+B[1])/2+uy*16); o=''
    for c in range(n):
        t=(m[0]+ux*c*10,m[1]+uy*c*10)
        o+='<polyline points="%.1f,%.1f %.1f,%.1f %.1f,%.1f" fill="none" stroke="%s" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>'%(t[0]-ux*10-nx*8,t[1]-uy*10-ny*8,t[0],t[1],t[0]-ux*10+nx*8,t[1]-uy*10+ny*8,col)
    return o
def quad(p,fill='#FBF6EA',stroke=NAVY,marks=None,corners=False,par=None):
    o='<polygon points="%s" fill="%s" stroke="%s" stroke-width="4.5" stroke-linejoin="round"/>'%(' '.join('%.1f,%.1f'%q for q in p),fill,stroke)
    n=len(p)
    if marks:
        for i in range(n): o+=tick(p[i],p[(i+1)%n],marks[i]) if marks[i] else ''
    if corners:
        for i in range(n):
            q=p[i];a=p[i-1];c=p[(i+1)%n];u=((a[0]-q[0])/d(a,q),(a[1]-q[1])/d(a,q));v=((c[0]-q[0])/d(c,q),(c[1]-q[1])/d(c,q));s=13
            if abs(u[0]*v[0]+u[1]*v[1])<0.02: o+='<polyline points="%.1f,%.1f %.1f,%.1f %.1f,%.1f" fill="none" stroke="%s" stroke-width="3"/>'%(q[0]+u[0]*s,q[1]+u[1]*s,q[0]+(u[0]+v[0])*s,q[1]+(u[1]+v[1])*s,q[0]+v[0]*s,q[1]+v[1]*s,OKG)
    if par:
        for k,(i,j,fl) in enumerate(par): o+=arrowsS(p[i],p[(i+1)%n],k+1)+arrowsS(p[j],p[(j+1)%n],k+1,flip=fl)
    return o
