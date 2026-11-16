# Storybook build: python3 build.py 3.09.02   (or several lesson ids; default = all)
# Writes repo/<page>.html (links assets/storybook, cache-busted) and build/g3-storybook-preview-<id>.html (everything inline).
# Layout: R/src (this kit), R/repo (repo files: assets, images, audio), R/build (crew.json, cuewords-<id>.json).
import re, json, base64, hashlib, os, sys
R = '/home/claude/g3sb/'
crew = json.load(open(R + 'build/crew.json'))
js = open(R + 'src/sb.js').read().replace('__CREW__', json.dumps(crew))
os.makedirs(R + 'repo/assets/storybook', exist_ok=True)
open(R + 'repo/assets/storybook/sb.js', 'w').write(js)
css = open(R + 'repo/assets/storybook/sb.css').read()
ver = hashlib.md5((js + css).encode()).hexdigest()[:8]
TB = 'https://optimaondemand.github.io/optima-4th-math/manipulatives/tool.html?t='
def NL(a, b, parts, lab='ends'): return ('numberline', {"a": a, "b": b, "parts": parts, "mode": "frac", "lab": lab}, 'Number Line')
TOOLS = {
 'fbars-yt': ('fbars', {"bm": "build", "d": [4, 6, 8], "bt": [], "sh": {}}, 'Fraction Tiles', 'This might be a good time to try the Fraction Tiles. Fill the bar with equal tiles, then shade some.'),
 'fbars-3': ('fbars', {"bm": "build", "d": [3], "bt": [], "sh": {}}, 'Fraction Tiles', 'Try it with tiles: how many one-third tiles fill 1 whole?'),
 'fcircles-3': ('fcircles', {"c": 1, "n": 3}, 'Fraction Circles', 'Try a circle cut into 3 equal slices. Shade 1 slice.'),
 'fcircles': ('fcircles', {"c": 1, "n": 10}, 'Fraction Circles', 'Cut a circle into 10 equal slices. Take some away and name both parts.'),
 'whiteboard': ('whiteboard', None, 'Grid Whiteboard', 'Draw a board with 7 equal parts on the Grid Whiteboard. Shade 2 that are apart.'),
 'nl-5': NL(0, 1, 5) + ('Try the Number Line in fifths. Put a dot on every mark and say its name.',),
 'nl-7': NL(0, 1, 7) + ('Try the Number Line in sevenths. Put a dot 3 jumps from 0.',),
 'nl-10': NL(0, 1, 10) + ('Try the Number Line in tenths. Count the spaces between 0 and 1.',),
 'nl-9': NL(0, 1, 9, 'all') + ('Try the Number Line in ninths. Check each label by counting jumps from 0.',),
 'nl-20': NL(0, 2, 20) + ('Try the Number Line from 0 to 2 in tenths. Find 1 first, then count past it.',),
 'fbars-9': ('fbars', {"d": [9], "lab": 1}, 'Fraction Tiles', 'Try two bars of ninths. Shade 3 tiles in one and 6 in the other. Which is more?'),
 'fbars-12': ('fbars', {"d": [12], "lab": 1}, 'Fraction Tiles', 'Try two bars of twelfths. Shade a different number of tiles in each. The bar with more shaded tiles is greater.'),
 'fbars-11': ('fbars', {"d": [11], "lab": 1}, 'Fraction Tiles', 'Try two bars of elevenths. Shade 2 tiles in one and 6 in the other. Say it with greater than.'),
 'fbars-10': ('fbars', {"d": [10], "lab": 1}, 'Fraction Tiles', 'Try two bars of tenths. Both bars are the same whole, so every tenth is the same size.'),
 'nl-10o': NL(0, 1, 10) + ('Try the Number Line in tenths. Put dots on three fractions. The dot farthest left is the least.',),
 'nl-10c': NL(0, 1, 10) + ('Try the Number Line in tenths. Put dots on two fractions. The one farther right is greater.',),
 'fbars-9-12': ('fbars', {"d": [9, 12], "lab": 1}, 'Fraction Tiles', 'Try a bar of ninths and a bar of twelfths. Shade the same number of tiles in each. Which bar shows more?'),
 'fbars-9-11': ('fbars', {"d": [9, 11], "lab": 1}, 'Fraction Tiles', 'Try a bar of ninths and a bar of elevenths. Shade 1 tile in each. Which tile is bigger?'),
 'fbars-5-10': ('fbars', {"d": [5, 10], "lab": 1}, 'Fraction Tiles', 'Try a bar of fifths and a bar of tenths. Shade the same number of tiles in each. Are they equal?'),
 'fbars-9-11-12': ('fbars', {"d": [9, 11, 12], "lab": 1}, 'Fraction Tiles', 'Try bars of ninths, elevenths and twelfths. Shade 1 tile in each and line them up from smallest to biggest.'),
 'fbars-3-12': ('fbars', {"d": [3, 12], "lab": 1}, 'Fraction Tiles', 'Try a bar of thirds and a bar of twelfths. Shade 2 thirds. How many twelfths reach the same place?'),
 'nl-12': NL(0, 1, 12) + ('Try the Number Line in twelfths. Count by twos: every 2 twelfths make 1 sixth.',),
 'fbars-7-12': ('fbars', {"d": [7, 12], "lab": 1}, 'Fraction Tiles', 'Try a bar of sevenths and a bar of twelfths. Shade the same number of tiles in each. Which reaches farther?'),
 'fbars-4-8-12': ('fbars', {"d": [4, 8, 12], "lab": 1}, 'Fraction Tiles', 'Try bars of fourths, eighths and twelfths. Shade 1 fourth. How many eighths and twelfths reach the same place?'),
 'fbars-3-6': ('fbars', {"d": [3, 6], "lab": 1}, 'Fraction Tiles', 'Try a bar of thirds and a bar of sixths. Shade 2 thirds. How many sixths reach the same place?'),
 'fbars-3-9': ('fbars', {"d": [3, 9], "lab": 1}, 'Fraction Tiles', 'Try a bar of thirds and a bar of ninths. Shade 1 third. How many ninths line up with it?'),
 'fbars-6-12': ('fbars', {"d": [6, 12], "lab": 1}, 'Fraction Tiles', 'Try a bar of sixths and a bar of twelfths. Shade some sixths, then find the twelfths that line up.'),
 'fbars-2-5-10': ('fbars', {"d": [2, 5, 10], "lab": 1}, 'Fraction Tiles', 'Try bars of halves, fifths and tenths. Shade 8 tenths. Which other bar can match it?'),
 'fbars-5-10c': ('fbars', {"d": [5, 10], "lab": 1}, 'Fraction Tiles', 'Line up a bar of fifths and a bar of tenths. How many tenths fit under one fifth?'),
 'fbars-16': ('fbars', {"bm": "build", "d": [16], "bt": [], "sh": {}}, 'Fraction Tiles', 'Fill a bar with one-sixteenth tiles. Shade 5, then shade 9 more, and count all the shaded tiles.'),
 'fbars-7': ('fbars', {"d": [7], "lab": 1}, 'Fraction Tiles', 'Try a bar of sevenths. Shade some tiles, then shade a few more. Count all the shaded sevenths.'),
 'fbars-9a': ('fbars', {"d": [9], "lab": 1}, 'Fraction Tiles', 'Try a bar of ninths. Shade 2 tiles, then 6 more. Are the tiles still ninths?'),
 'fbars-9c': ('fbars', {"bm": "build", "d": [9], "bt": [], "sh": {}}, 'Fraction Tiles', 'Fill a bar with ninth tiles until it is 1 whole. How many ninths make 1?'),
 'nl-12b': NL(0, 1, 12) + ('Try the Number Line in twelfths. Put a dot on a fraction, then hop back to take some away.',),
 'nl-11': NL(0, 1, 11) + ('Try the Number Line in elevenths. Start near 1 and hop back two times.',),
 'fbars-half': ('fbars', {"d": [2, 9, 10], "lab": 1}, 'Fraction Tiles', 'Line up a one-half tile with a bar of ninths and a bar of tenths. Which fractions stop before the half tile ends?'),
 'fbars-8': ('fbars', {"d": [8], "lab": 1}, 'Fraction Tiles', 'Try a bar of eighths. Each eighth is as long as 2 sixteenths.'),
 'fbars-16c': ('fbars', {"bm": "build", "d": [16], "bt": [], "sh": {}}, 'Fraction Tiles', 'Fill a bar with one-sixteenth tiles. Add some, then take some away. Say each step out loud.'),
 'fbars-9b': ('fbars', {"d": [9], "lab": 1}, 'Fraction Tiles', 'Try a bar of ninths. Shade some tiles, add a few more, then take one away.'),
 'fbars-11g': ('fbars', {"d": [11], "lab": 1}, 'Fraction Tiles', 'Try two bars of elevenths. Shade a different number of tiles in each, then count the extra tiles in the longer bar.'),
 'fbars-12g': ('fbars', {"d": [12], "lab": 1}, 'Fraction Tiles', 'Try two bars of twelfths. Shade a different number in each. How many more tiles does the longer bar have?'),
 'fbars-8-16': ('fbars', {"d": [8, 16], "lab": 1}, 'Fraction Tiles', 'Line up a bar of eighths and a bar of sixteenths. How many sixteenths fit under one eighth?'),
 'nl-11b': NL(0, 1, 11) + ('Try the Number Line in elevenths. Put a dot on a fraction, hop back, then hop forward.',),
 'ruler-m': ('ruler', {"u": "m", "a": 0, "b": 91, "len": 91}, 'Rulers', 'Measure a ribbon on the meter stick. Is it more or less than 1 meter? How many centimeters is 1 meter?'),
 'ruler-cm': ('ruler', {"u": "cm", "a": 0, "b": 11, "len": 11}, 'Rulers', 'Drag the ribbon so its left end is on 0, then read the other end.'),
 'bond-m': ('bond', {"parts": 2, "w": "163 cm", "p": ["100 cm", "?"]}, 'Number Bond', 'Split 163 cm into 100 cm and the rest. The 100 cm is 1 meter.'),
 'bond-m2': ('bond', {"parts": 2, "w": "628 cm", "p": ["600 cm", "?"]}, 'Number Bond', 'Split 628 cm into hundreds and the rest. Each hundred centimeters is 1 meter.'),
 'bond-100': ('bond', {"parts": 2, "w": "100 cm", "p": ["23 cm", "?"]}, 'Number Bond', 'One meter is 100 cm. Split it into 23 cm and the rest. Count up to 100.'),
 'bond-km': ('bond', {"parts": 2, "w": "4,300 m", "p": ["4,000 m", "?"]}, 'Number Bond', 'Split 4,300 m into the thousands and the rest. Every 1,000 m is 1 km.'),
 'bond-km2': ('bond', {"parts": 2, "w": "8,600 m", "p": ["8,000 m", "?"]}, 'Number Bond', 'Split 8,600 m into the thousands and the rest. The thousands are the kilometers.'),
 'bond-1000': ('bond', {"parts": 2, "w": "1,000 m", "p": ["650 m", "?"]}, 'Number Bond', 'One kilometer is 1,000 m. Split it into 650 m and the rest. Count up to 1,000.'),
 'beaker-50': ('beaker', {"u": "ml", "mx": 1000, "tk": 50, "a0": 0}, 'Beakers', 'Fill a beaker that holds 1,000 mL. Its marks go up by 50: count 50, 100, 150 as the water rises.'),
 'beaker-2l': ('beaker', {"u": "ml", "mx": 2000, "tk": 50, "a0": 0}, 'Beakers', 'Fill a beaker past 1,000 mL. Every 1,000 mL is 1 liter, and the rest are milliliters.'),
 'bond-ml': ('bond', {"parts": 2, "w": "8,300 mL", "p": ["8,000 mL", "?"]}, 'Number Bond', 'Split 8,300 mL into the thousands and the rest. Every 1,000 mL is 1 liter.'),
 'fbars-9-10': ('fbars', {"d": [9, 10], "lab": 1}, 'Fraction Tiles', 'Try a bar of ninths and a bar of tenths. Shade 1 ninth and 2 tenths. Which reaches farther?'),
}
def enc(o): return base64.urlsafe_b64encode(json.dumps(o, separators=(',', ':')).encode()).decode().rstrip('=')
GL_BASE = [
  {"t": "fraction", "d": "A number that names equal parts of one whole, like one-third.", "key": True},
  {"t": "equal parts", "d": "Parts that are all the same size.", "key": True},
  {"t": "numerator", "d": "The top number of a fraction. It tells how many parts you are counting.", "key": True},
  {"t": "denominator", "d": "The bottom number of a fraction. It tells how many equal parts make the whole.", "key": True},
  {"t": "unit fraction", "d": "A fraction with 1 on top, like one-third. It names one equal part."},
  {"t": "bridge", "d": "A small wedge under a string. It holds the string up and cuts it into parts you can pluck."},
  {"t": "lyre", "d": "A string instrument from ancient Greece. You pluck its strings."}]
L = {
 '3.09.01': dict(page='math-lesson-3-09-01-fractions-of-a-whole.html', title='Fractions of a Whole', video='g3math-09-01-learn',
   glossary=GL_BASE[:4] + [
     {"t": "string", "d": "A thin cord pulled tight. When you pluck it, it shakes and makes a sound.", "key": True},
     {"t": "note", "d": "One musical sound. A note can be high or low.", "key": True},
     GL_BASE[4], {"t": "whole", "d": "All of something. All the equal parts together make 1 whole."}, GL_BASE[5], GL_BASE[6]]),
 '3.09.02': dict(page='math-lesson-3-09-02-fractions-on-a-number-line.html', title='Fractions on a Number Line', video='g3math-09-02-learn',
   glossary=[
     {"t": "number line", "d": "A straight line with numbers on it in order, equally spaced, like a ruler.", "key": True},
     {"t": "tick mark", "d": "A short line that crosses the number line. Tick marks cut the line into equal parts.", "key": True},
     {"t": "unit fraction", "d": "A fraction with 1 on top, like one-seventh. On a number line, it is one jump.", "key": True},
     GL_BASE[1],
     {"t": "zero", "d": "Where the number line starts. At 0 you have not jumped yet.", "key": True},
     {"t": "one whole", "alt": ["1 whole"], "d": "All the equal parts together. On the number line, 1 whole is the mark at 1.", "key": True},
     GL_BASE[0], GL_BASE[2], GL_BASE[3],
     {"t": "jump", "d": "One move from one tick mark to the next one."},
     GL_BASE[5]]),
 '3.09.03': dict(page='math-lesson-3-09-03-comparing-fractions-like-denominators.html', title='Comparing Fractions with Like Denominators', video='g3math-09-03-learn',
   glossary=[
     {"t": "compare", "d": "To look at two numbers and find out which is greater, which is less, or if they are equal.", "key": True},
     {"t": "greater than", "d": "More than. The symbol is >. The open side faces the greater number.", "key": True},
     {"t": "less than", "d": "Not as much as. The symbol is <. The point faces the smaller number.", "key": True},
     {"t": "equal to", "d": "The same amount. The symbol is =.", "key": True},
     {"t": "same denominator", "d": "Two fractions with the same bottom number. Their parts are the same size.", "key": True},
     GL_BASE[2], GL_BASE[3], GL_BASE[1],
     {"t": "least to greatest", "d": "In order from the smallest amount to the biggest amount."},
     GL_BASE[5]]),
 '3.09.04': dict(page='math-lesson-3-09-04-comparing-fractions-like-numerators.html', title='Comparing Fractions with Like Numerators', video='g3math-09-04-learn',
   glossary=[
     {"t": "unit fraction", "d": "A fraction with 1 on top, like one-ninth. It names one equal part. More parts in the whole make each part smaller.", "key": True},
     {"t": "denominator", "d": "The bottom number of a fraction. It tells how many equal parts make the whole. A bigger denominator means smaller parts.", "key": True},
     {"t": "same numerator", "d": "Two fractions with the same top number. They have the same number of parts, but the parts may not be the same size."},
     GL_BASE[2],
     {"t": "pipe", "d": "A hollow tube. When you blow across it, it whistles. A short pipe whistles a higher note than a long pipe."},
     {"t": "compare", "d": "To look at two numbers and find out which is greater, which is less, or if they are equal."},
     {"t": "least to greatest", "d": "In order from the smallest amount to the biggest amount."},
     GL_BASE[1], GL_BASE[5]]),
 '3.10.01': dict(page='math-lesson-3-10-01-equivalent-fractions.html', title='Equivalent Fractions', video='g3math-10-01-learn',
   glossary=[
     {"t": "equivalent fractions", "d": "Fractions that name the same amount, like one-fifth and two-tenths. Equivalent sounds like equal.", "key": True},
     {"t": "equivalent", "d": "Equal in amount. Same amount, new name.", "key": True},
     {"t": "measure", "d": "In music, one measure is one whole. Notes of different lengths can fill it.", "key": True},
     GL_BASE[1], GL_BASE[2], GL_BASE[3],
     {"t": "one whole", "alt": ["1 whole"], "d": "All the equal parts together."},
     {"t": "half note", "d": "A note that lasts for one-half of a measure."},
     {"t": "quarter note", "d": "A note that lasts for one-fourth of a measure."},
     {"t": "eighth note", "d": "A note that lasts for one-eighth of a measure."}]),
 '3.10.02': dict(page='math-lesson-3-10-02-finding-equivalent-fractions.html', title='Finding Equivalent Fractions', video='g3math-10-02-learn',
   glossary=[
     {"t": "equivalent fractions", "d": "Fractions that name the same amount, like one-fourth and three-twelfths.", "key": True},
     {"t": "multiply", "d": "To find the total of equal groups. 4 × 3 means 4 groups of 3.", "key": True},
     GL_BASE[2], GL_BASE[3],
     {"t": "variation", "d": "A new version of a piece of music. It keeps the same measures and low notes but fills them with new notes.", "key": True},
     {"t": "measure", "d": "In music, one measure is one whole. Notes of different lengths can fill it.", "key": True},
     GL_BASE[1],
     {"t": "aria", "d": "A slow song. Bach's book of variations starts with one."},
     {"t": "one whole", "alt": ["1 whole"], "d": "All the equal parts together."}]),
 '3.10.03': dict(page='math-lesson-3-10-03-simplifying-fractions.html', title='Simplifying Fractions', video='g3math-10-03-learn',
   glossary=[
     {"t": "simplest form", "d": "A fraction is in simplest form when no number except 1 divides both the numerator and the denominator. It has the fewest, biggest parts.", "key": True},
     {"t": "simplify", "alt": ["simplifying", "simpler name"], "d": "To find a simpler name for a fraction by dividing the numerator and the denominator by the same number.", "key": True},
     {"t": "equivalent fractions", "d": "Fractions that name the same amount, like eight-tenths and four-fifths.", "key": True},
     GL_BASE[2], GL_BASE[3],
     {"t": "measure", "d": "In music, one measure is one whole. Notes of different lengths can fill it.", "key": True},
     {"t": "divide", "alt": ["divided"], "d": "To split into equal groups. 8 ÷ 2 = 4 means 8 split into groups of 2 makes 4 groups."},
     {"t": "hymn", "d": "A song sung in church. Bach used old hymn tunes in his music."},
     {"t": "sixteenth note", "alt": ["sixteenth notes"], "d": "A note that lasts for one-sixteenth of a measure. 16 of them fill one measure."},
     {"t": "eighth note", "d": "A note that lasts for one-eighth of a measure."}]),
 '3.10.04': dict(page='math-lesson-3-10-04-comparing-fractions-part-1.html', title='Comparing Fractions, Part 1', video='g3math-10-04-learn',
   glossary=[
     {"t": "common denominator", "d": "The same denominator for two fractions. When two fractions have a common denominator, their pieces are the same size, so you can count and compare.", "key": True},
     {"t": "common numerator", "d": "The same numerator for two fractions. Then the fraction with the bigger pieces is greater.", "key": True},
     {"t": "re-cut", "alt": ["re-cutting"], "d": "To cut every piece of a bar into the same number of smaller pieces. The amount stays the same, but the fraction gets a new name.", "key": True},
     GL_BASE[2], GL_BASE[3],
     {"t": "measure", "d": "In music, one measure is one whole. Notes of different lengths can fill it.", "key": True},
     {"t": "multiply", "d": "To find the total of equal groups. 4 × 2 means 4 groups of 2."},
     {"t": "invention", "alt": ["inventions"], "d": "A short practice piece Bach wrote with two parts, one for each hand."},
     {"t": "harpsichord", "d": "A keyboard instrument from Bach's time. Its keys pluck the strings inside."}]),
 '3.10.05': dict(page='math-lesson-3-10-05-comparing-fractions-part-2.html', title='Comparing Fractions, Part 2', video='g3math-10-05-learn',
   glossary=[
     {"t": "benchmark", "d": "A number we compare to, like one-half or 1 whole.", "key": True},
     {"t": "one-half", "alt": ["halfway"], "d": "The halfway point of a whole. To find half of a denominator, divide it by 2.", "key": True},
     {"t": "cantata", "d": "A piece of music for singers and players. Bach wrote many of them.", "key": True},
     GL_BASE[2], GL_BASE[3],
     {"t": "missing piece", "alt": ["missing pieces"], "d": "The part of a whole that is not shaded. A smaller missing piece means the fraction is closer to 1 whole."},
     {"t": "coffee house", "d": "A place where people met to drink coffee and talk. Bach's music group played in one in Leipzig."},
     {"t": "flute", "d": "A wind instrument you play by blowing across a hole. In Bach's time it was made of wood."}]),
  '3.10.06': dict(page='math-lesson-3-10-06-adding-subtracting-fractions-part-1.html', title='Adding and Subtracting Fractions, Part 1', video='g3math-10-06-learn',
   glossary=[
     {"t": "unit", "d": "The size of the piece you are counting. In 5 sixteenths + 9 sixteenths, the unit is sixteenths.", "key": True},
     {"t": "sum", "d": "The answer when you add. 4 ninths + 3 ninths: the sum is 7 ninths.", "key": True},
     {"t": "difference", "d": "The answer when you subtract. 7 ninths − 5 ninths: the difference is 2 ninths.", "key": True},
     {"t": "copyist", "alt": ["copyists"], "d": "A person who copies music by hand, note by note.", "key": True},
     GL_BASE[2], GL_BASE[3],
     {"t": "measure", "d": "In music, one measure is one whole. Notes of different lengths can fill it.", "key": True},
     {"t": "sixteenth note", "alt": ["sixteenth notes"], "d": "A note that lasts for one-sixteenth of a measure. 16 of them fill one measure."},
     {"t": "cantata", "d": "A piece of music for singers and players. Bach wrote many of them.", "key": True},
     {"t": "musette", "d": "A happy dance with a low note that keeps sounding, like bagpipes."}]),
  '3.11.01': dict(page='math-lesson-3-11-01-meters-and-centimeters.html', title='Meters and Centimeters', video='g3math-11-01-learn', music='haydn-101-clock-andante.mp3',
   glossary=[
     {"t": "meter", "alt": ["meters"], "d": "A unit for measuring length. 1 meter is 100 centimeters, about the width of a door.", "key": True},
     {"t": "centimeter", "alt": ["centimeters"], "d": "A small unit of length, about as wide as your smallest fingernail. 100 centimeters make 1 meter.", "key": True},
     {"t": "length", "d": "How long something is from one end to the other.", "key": True},
     {"t": "meter stick", "alt": ["meter sticks"], "d": "A ruler that is exactly 1 meter long, with marks for every centimeter.", "key": True},
     {"t": "centimeter ruler", "d": "A short ruler with marks for every centimeter. Start measuring at its 0."},
     {"t": "marble", "d": "A hard, smooth stone. It does not shrink or bend, so it makes a good measuring stick."},
     {"t": "quill pen", "d": "A pen made from a long bird feather. People dipped it in ink to write."},
     {"t": "unit", "d": "The size you measure with, like a meter or a centimeter."}]),
  '3.11.02': dict(page='math-lesson-3-11-02-subtracting-from-meters.html', title='Subtracting from Meters', video='g3math-11-02-learn', music='haydn-94-surprise-andante.mp3',
   glossary=[
     {"t": "subtract", "d": "To take away. 9 m − 47 cm means take 47 cm away from 9 m.", "key": True},
     {"t": "remaining", "d": "What is left after you take some away. After a cut, the ribbon still on the roll is the remaining ribbon.", "key": True},
     {"t": "break a meter", "d": "Change one whole meter into 100 centimeters so you can take centimeters away.", "key": True},
     {"t": "compound units", "d": "Two units used together to write one length, like 8 m 72 cm.", "key": True},
     {"t": "meter", "alt": ["meters"], "d": "A unit for measuring length. 1 meter is 100 centimeters."},
     {"t": "centimeter", "alt": ["centimeters"], "d": "A small unit of length. 100 centimeters make 1 meter."},
     {"t": "roll", "d": "A long piece of ribbon or cloth wound up so it is easy to store and cut."},
     {"t": "trim", "d": "Ribbon or lace sewn onto clothes and hats to decorate them."}]),
  '3.11.03': dict(page='math-lesson-3-11-03-kilometers.html', title='Kilometers', video='g3math-11-03-learn', music='mozart-34-andante.mp3',
   glossary=[
     {"t": "kilometer", "alt": ["kilometers"], "d": "A unit for long distances. 1 kilometer is 1,000 meters, about a 15-minute walk. We write km.", "key": True},
     {"t": "distance", "d": "How far it is from one place to another.", "key": True},
     {"t": "travel distance", "d": "The distance along a road or a curved path from one place to another.", "key": True},
     {"t": "direct distance", "d": "The distance along a straight line from one place to another.", "key": True},
     {"t": "meter", "alt": ["meters"], "d": "A unit of length. 1,000 meters make 1 kilometer."},
     {"t": "compound units", "d": "Two units used together to write one distance, like 3 km 400 m."},
     {"t": "telegraph", "d": "A way to send messages far away. Chappe's telegraph used towers with moving arms."},
     {"t": "telescope", "d": "A tube with lenses that makes faraway things look closer."}]),
  '3.11.04': dict(page='math-lesson-3-11-04-subtracting-from-kilometers.html', title='Subtracting from Kilometers', video='g3math-11-04-learn', music='haydn-104-andante.mp3',
   glossary=[
     {"t": "break a kilometer", "d": "Change one whole kilometer into 1,000 meters so you can take meters away.", "key": True},
     {"t": "survey", "d": "A big job of measuring the land: how far, how high and which way.", "key": True},
     {"t": "baseline", "d": "One straight line measured very carefully, step by step, at the start of a survey.", "key": True},
     {"t": "kilometer", "alt": ["kilometers"], "d": "A unit for long distances. 1 kilometer is 1,000 meters. We write km."},
     {"t": "subtract", "d": "To take away. 3 km − 450 m means take 450 m away from 3 km."},
     {"t": "compound units", "d": "Two units used together to write one distance, like 2 km 550 m."},
     {"t": "ruler", "alt": ["rulers"], "d": "A straight strip marked with equal units, used to measure length."}]),
  '3.11.05': dict(page='math-lesson-3-11-05-liters-and-milliliters.html', title='Liters and Milliliters', video='g3math-11-05-learn', music='handel-water-music-air.mp3',
   glossary=[
     {"t": "liter", "alt": ["liters"], "d": "A unit for how much liquid there is. 1 liter is 1,000 milliliters. We write L.", "key": True},
     {"t": "milliliter", "alt": ["milliliters"], "d": "A tiny unit for liquid. 1,000 milliliters fill 1 liter. We write mL.", "key": True},
     {"t": "capacity", "d": "How much a container can hold when it is full.", "key": True},
     {"t": "beaker", "alt": ["beakers"], "d": "A clear cup with marks on the side, used to measure liquid.", "key": True},
     {"t": "thermometer", "d": "A tool that shows how hot or cold something is.", "key": True},
     {"t": "degree", "alt": ["degrees"], "d": "The unit on a thermometer. We write °. 70 °F means 70 degrees Fahrenheit.", "key": True},
     {"t": "temperature", "d": "How hot or cold something is."},
     {"t": "Fahrenheit", "d": "One scale on a thermometer, written °F. Water freezes at 32 °F."},
     {"t": "Celsius", "d": "Another scale on a thermometer, written °C. Water freezes at 0 °C."},
     {"t": "pint", "d": "An old measure for liquid. The old Paris pint was a little smaller than a liter."}]),
  '3.10.07': dict(page='math-lesson-3-10-07-adding-subtracting-fractions-part-2.html', title='Adding and Subtracting Fractions, Part 2', video='g3math-10-07-learn',
   glossary=[
     {"t": "clue word", "alt": ["clue words"], "d": "A word in a story problem that tells you what to do, like more (add) or left (take away).", "key": True},
     {"t": "altogether", "d": "All of it put together. Altogether is a clue to add.", "key": True},
     {"t": "how much more", "d": "A question that asks for the gap between two amounts. Line them up and count the extra pieces.", "key": True},
     {"t": "simplest form", "d": "A fraction written with the fewest, biggest pieces. 2 twelfths in simplest form is 1 sixth.", "key": True},
     {"t": "difference", "d": "The answer when you subtract. 6 sevenths − 1 seventh: the difference is 5 sevenths.", "key": True},
     GL_BASE[2], GL_BASE[3],
     {"t": "unit", "d": "The size of the piece you are counting. In 4 ninths + 4 ninths, the unit is ninths.", "key": True},
     {"t": "gallery", "d": "A high balcony inside a church, where the singers and players stood."},
     {"t": "cantata", "d": "A piece of music for singers and players. Bach wrote many of them.", "key": True},
     {"t": "chorale", "d": "A hymn tune that everyone in church could sing."}]),
}
def tool(m):
    t, st, name, tip = TOOLS[m.group(1)]
    url = TB + t + '&amp;st=1' + ('#s=' + enc(st) if st else '')
    return '<a class="sb-tool" href="%s" target="_blank" rel="noopener" title="%s">🧮 Try the %s ↗</a>' % (url, tip, name)
def num(a, lab='answer', h=''):
    return '<input class="sb-ans" data-a="%s" inputmode="numeric" autocomplete="off" aria-label="%s"%s>' % (a, lab, (' data-hint="' + h.replace('"', '&quot;') + '"') if h else '')
def tok(m):
    t = m.group(1); h = ''
    if '~' in t: t, h = t.split('~', 1)
    k, v = t.split(':', 1)
    if k == 'n': return num(v, 'number', h)
    if k == 'w': return '<input class="sb-ans word" data-a="%s" autocomplete="off" aria-label="word"%s>' % (v, (' data-hint="' + h.replace('"', '&quot;') + '"') if h else '')
    if k == 'fr':
        a, b = v.split(':'); return '<span class="sb-frac">' + num(a, 'top number', h) + '<i></i>' + num(b, 'bottom number', h) + '</span>'
def b64(p, mt): return 'data:%s;base64,%s' % (mt, base64.b64encode(open(p, 'rb').read()).decode())
def build(lid):
    c = L[lid]; slug = lid.replace('.', '-')
    html = open(R + 'src/lesson-%s.html' % slug).read()
    html = re.sub(r'\[\[(.*?)\]\]', tok, html)
    html = re.sub(r'\{\{TOOL:([^}]+)\}\}', tool, html)
    data = {"lesson": lid, "key": "g3sb-" + slug, "title": c['title'], "audioBase": "audio/storybook/", "imgBase": "images/storybook/",
            "music": c.get("music", "bach-cello-suite-1-prelude.mp3"), "audioReady": True, "glossary": c['glossary'], "cueWords": {}}
    for cw in (R + 'build/cuewords-%s.json' % slug, R + 'build/cuewords.json' if lid == '3.09.01' else ''):
        if cw and os.path.exists(cw): data['cueWords'] = json.load(open(cw)); break
    html = html.replace('{{DATA}}', json.dumps(data))
    v = c['video']; mp4 = R + 'repo/assets/video/%s.mp4' % v
    LV = '<video controls preload="metadata" playsinline poster="assets/video/%s.jpg" src="assets/video/%s.mp4"></video>' % (v, v)
    for inline, path in ((False, R + 'repo/' + c['page']), (True, R + 'build/g3-storybook-preview-%s.html' % slug)):
        h = html.replace('{{LEARNVIDEO}}', LV)
        if inline:
            h = re.sub(r'\{\{IMG:([^}]+)\}\}', lambda m: b64(R + 'repo/images/storybook/' + m.group(1), 'image/png' if m.group(1).endswith('png') else 'image/jpeg'), h)
            for vf, mt in [(f, 'video/mp4' if f.endswith('mp4') else 'image/jpeg') for f in sorted(set(re.findall(r'assets/video/[\w.-]+\.(?:mp4|jpg)', h)))]:
                if os.path.exists(R + 'repo/' + vf): h = h.replace(vf, b64(R + 'repo/' + vf, mt))
            h = h.replace('{{CSS}}', '<style>' + css + '</style>')
            aud = {}
            for root, _, fs in os.walk(R + 'repo/audio/storybook'):
                for f in fs:
                    rel = os.path.relpath(os.path.join(root, f), R + 'repo/audio/storybook')
                    if rel.startswith('g3m-3-') and not rel.startswith('g3m-' + slug): continue
                    aud[rel] = b64(os.path.join(root, f), 'audio/mpeg')
            h = h.replace('{{PRE}}', '<script>window.SB_IMG={"opti-owl.png":"%s"};window.SB_AUDIO=%s;</script>' % (b64(R + 'repo/images/storybook/opti-owl.png', 'image/png'), json.dumps(aud)))
            h = h.replace('{{JS}}', '<script>' + js + '</script>')
        else:
            h = re.sub(r'\{\{IMG:([^}]+)\}\}', lambda m: 'images/storybook/' + m.group(1), h)
            h = h.replace('{{CSS}}', '<link rel="stylesheet" href="assets/storybook/sb.css?v=%s">' % ver)
            h = h.replace('{{PRE}}', '').replace('{{JS}}', '<script src="assets/storybook/sb.js?v=%s"></script>' % ver)
        open(path, 'w').write(h); print(path, len(h) // 1024, 'KB')
for lid in (sys.argv[1:] or list(L)): build(lid)
