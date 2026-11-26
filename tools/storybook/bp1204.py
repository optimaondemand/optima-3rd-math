# bp1204: add 3.12.04 to tools/storybook/build.py (run once on her computer): python3 bp1204.py tools/storybook/build.py
import sys
p = sys.argv[1]; s = open(p).read()
TOOL = (' \'rods-tri\': (\'cuisenaire\', {"r": [], "lab": 1, "rows": 8}, \'Cuisenaire Rods\', \'Pick any 3 rods. Can you lay them end to end so they close into a triangle?\'),\n'
        ' \'geoboard-tri\': (\'geoboard\', {"n": 11}, \'Geoboard\', \'Make a triangle with one band. Count its sides and its vertices.\'),\n')
ENTRY = '''  '3.12.04': dict(page='math-lesson-3-12-04-triangles.html', title='Triangles', video='g3math-12-04-learn', music='liszt-triangle-scherzo.mp3',
   glossary=[
     {"t": "triangle", "alt": ["triangles"], "d": "A closed shape with 3 straight sides, 3 vertices and 3 angles.", "key": True},
     {"t": "closed shape", "alt": ["closed"], "d": "A shape whose sides all meet, with no gaps. You could trace all the way around and end where you started.", "key": True},
     {"t": "side", "alt": ["sides"], "d": "One straight part of a shape's edge. A triangle has 3 sides.", "key": True},
     {"t": "tick marks", "alt": ["tick mark"], "d": "Small marks on sides that are the same length. Same number of marks, same length.", "key": True},
     {"t": "vertex", "alt": ["vertices"], "d": "A corner where two sides meet. A triangle has 3 vertices.", "key": True},
     {"t": "angle", "alt": ["angles"], "d": "The opening between two sides that meet at a vertex.", "key": True},
     {"t": "rod", "alt": ["rods"], "d": "A colored wooden bar. Each color is a different length, from 1 to 10."},
     {"t": "geoboard", "d": "A board with rows of pins. You stretch rubber bands around the pins to make shapes."},
     {"t": "set square", "d": "A flat triangle with one square corner. It helps you check right angles."},
     {"t": "temple", "d": "A big building made long ago for worship."},
     {"t": "orchestra", "d": "A big group of musicians who play many kinds of instruments together."},
     {"t": "concerto", "d": "A piece of music where one player, here on the piano, plays with a whole orchestra."}]),
'''
if "'3.12.04': dict(" in s: print('already'); sys.exit()
assert " 'setsquare': (" in s and "  '3.11.06': dict(" in s
s = s.replace(" 'setsquare': (", TOOL + " 'setsquare': (", 1).replace("  '3.11.06': dict(", ENTRY + "  '3.11.06': dict(", 1)
open(p, 'w').write(s); print('ok')
