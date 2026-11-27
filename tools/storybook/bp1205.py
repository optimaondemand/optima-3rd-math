# bp1205: add 3.12.05 to tools/storybook/build.py (run once on her computer): python3 bp1205.py tools/storybook/build.py
import sys
p = sys.argv[1]; s = open(p).read()
TOOL = (' \'rods-sort\': (\'cuisenaire\', {"r": [], "lab": 1, "rows": 8}, \'Cuisenaire Rods\', \'Build a triangle from 3 rods. Are all 3 rods the same length, 2 the same, or none the same?\'),\n'
        ' \'geoboard-names\': (\'geoboard\', {"n": 11}, \'Geoboard\', \'Make a triangle with one band. How many sides are the same length? Check each corner with a square corner.\'),\n')
ENTRY = '''  '3.12.05': dict(page='math-lesson-3-12-05-properties-of-triangles.html', title='Properties of Triangles', video='g3math-12-05-learn', music='pachelbel-canon-macleod.mp3',
   glossary=[
     {"t": "equilateral", "d": "A triangle with all 3 sides the same length.", "key": True},
     {"t": "isosceles", "d": "A triangle with at least 2 sides the same length.", "key": True},
     {"t": "scalene", "d": "A triangle with no sides the same length.", "key": True},
     {"t": "acute", "d": "A triangle whose 3 angles are all smaller than a square corner.", "key": True},
     {"t": "obtuse", "d": "A triangle with one angle bigger than a square corner.", "key": True},
     {"t": "right triangle", "alt": ["right triangles"], "d": "A triangle with one square corner (a right angle).", "key": True},
     {"t": "equal sides", "alt": ["equal side"], "d": "Sides that are the same length.", "key": True},
     {"t": "tick marks", "alt": ["tick mark"], "d": "Small marks on sides. Sides with the same number of marks are the same length."},
     {"t": "rod", "alt": ["rods"], "d": "A colored wooden bar. Each color is a different length, from 1 to 10."},
     {"t": "geoboard", "d": "A board with rows of pins. You stretch rubber bands around the pins to make shapes."},
     {"t": "set square", "d": "A flat triangle with one square corner. It helps you check angles."},
     {"t": "Greek", "d": "The language of ancient Greece. Euclid wrote his book in Greek."},
     {"t": "canon", "d": "A piece of music where players play the same tune, one starting after another."}]),
'''
if "'3.12.05': dict(" in s: print('already'); sys.exit()
assert " 'setsquare': (" in s and "  '3.12.04': dict(" in s
s = s.replace(" 'setsquare': (", TOOL + " 'setsquare': (", 1).replace("  '3.12.04': dict(", ENTRY + "  '3.12.04': dict(", 1)
open(p, 'w').write(s); print('ok')
