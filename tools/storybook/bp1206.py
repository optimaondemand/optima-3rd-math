# bp1206: add 3.12.06 to tools/storybook/build.py (run once on her computer): python3 bp1206.py tools/storybook/build.py
import sys
p = sys.argv[1]; s = open(p).read()
TOOL = (' \'geoboard-quad\': (\'geoboard\', {"n": 11, "bands": [{"p": [[2, 3], [8, 3], [8, 7], [2, 7]], "k": 1, "c": 0}]}, \'Geoboard\', \'Move the corners of the rectangle to make new 4-sided shapes. Which sides stay parallel?\'),\n')
ENTRY = '''  '3.12.06': dict(page='math-lesson-3-12-06-properties-of-quadrilaterals.html', title='Properties of Quadrilaterals', video='g3math-12-06-learn', music='haydn-lark-quartet.mp3',
   glossary=[
     {"t": "quadrilateral", "alt": ["quadrilaterals"], "d": "A closed shape with 4 straight sides and 4 corners.", "key": True},
     {"t": "parallel", "d": "Parallel sides go the same way, like train tracks. They never meet, even if you make them longer.", "key": True},
     {"t": "parallelogram", "alt": ["parallelograms"], "d": "A quadrilateral with 2 pairs of parallel sides.", "key": True},
     {"t": "trapezoid", "alt": ["trapezoids"], "d": "A quadrilateral with at least 1 pair of parallel sides.", "key": True},
     {"t": "rectangle", "alt": ["rectangles"], "d": "A quadrilateral with 4 square corners.", "key": True},
     {"t": "rhombus", "alt": ["rhombuses"], "d": "A quadrilateral with 4 equal sides.", "key": True},
     {"t": "square", "alt": ["squares"], "d": "A quadrilateral with 4 equal sides and 4 square corners.", "key": True},
     {"t": "tick marks", "alt": ["tick mark"], "d": "Small marks on sides. Sides with the same number of marks are the same length."},
     {"t": "arrow marks", "alt": ["arrow mark"], "d": "Small arrows on sides. Sides with the same arrows are parallel."},
     {"t": "geoboard", "d": "A board with rows of pins. You stretch rubber bands around the pins to make shapes."},
     {"t": "set square", "d": "A flat triangle with one square corner. It helps you check corners."},
     {"t": "oblong", "d": "Euclid's word for a rectangle that is not a square."},
     {"t": "quartet", "d": "A group of 4 musicians. A string quartet has 2 violins, a viola and a cello."}]),
'''
if "'3.12.06': dict(" in s: print('already'); sys.exit()
assert " 'setsquare': (" in s and "  '3.12.05': dict(" in s
s = s.replace(" 'setsquare': (", TOOL + " 'setsquare': (", 1).replace("  '3.12.05': dict(", ENTRY + "  '3.12.05': dict(", 1)
open(p, 'w').write(s); print('ok')
