# bp1207: add 3.12.07 to tools/storybook/build.py (run once on her computer): python3 bp1207.py tools/storybook/build.py
import sys
p = sys.argv[1]; s = open(p, encoding='utf-8').read()
TOOL = (" 'geoboard-sym': ('geoboard', {\"n\": 11}, 'Geoboard', 'Make half a shape on one side of a line of pins, then build the other half so both halves match.'),\n"
        " 'compass-sym': ('compass', {\"r\": 3, \"lines\": True}, 'Compass', 'Open the compass to 3 cm and draw a circle. Then open it wider and draw another one around the same needle point. Which circle is bigger?'),\n")
ENTRY = '''  '3.12.07': dict(page='math-lesson-3-12-07-using-a-compass.html', title='Lines of Symmetry', video='g3math-12-07-learn', music='bach-mirror-canon.mp3',
   glossary=[
     {"t": "line of symmetry", "alt": ["lines of symmetry"], "d": "A fold line that makes the two halves of a shape match exactly.", "key": True},
     {"t": "symmetric", "d": "A shape is symmetric when it has at least one line of symmetry.", "key": True},
     {"t": "matching halves", "alt": ["matching half"], "d": "Two halves that land right on top of each other when you fold.", "key": True},
     {"t": "mirror image", "alt": ["mirror images"], "d": "The same shape, facing the other way, like what you see in a mirror.", "key": True},
     {"t": "compass", "d": "A tool with a needle point and a pencil. It draws circles.", "key": True},
     {"t": "radius", "alt": ["radii"], "d": "The distance from the middle of a circle to its edge.", "key": True},
     {"t": "diameter", "d": "The distance straight across a circle through the middle. It is 2 radii.", "key": True},
     {"t": "scalene", "d": "A triangle with no sides the same length."},
     {"t": "geoboard", "d": "A board with rows of pins. You stretch rubber bands around the pins to make shapes."},
     {"t": "temple", "d": "A big building made long ago for worship."},
     {"t": "canon", "d": "A piece of music where players play the same tune, one starting after another."},
     {"t": "upside down", "d": "In music, a tune turned over: where it went up, it goes down."}]),
'''
if "'3.12.07': dict(" in s: print('already'); sys.exit()
assert " 'setsquare': (" in s and "  '3.12.06': dict(" in s
s = s.replace(" 'setsquare': (", TOOL + " 'setsquare': (", 1).replace("  '3.12.06': dict(", ENTRY + "  '3.12.06': dict(", 1)
open(p, 'w', encoding='utf-8').write(s); print('ok')
