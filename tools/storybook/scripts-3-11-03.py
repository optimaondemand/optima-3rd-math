O={
'warm-1':"Hoo! It's Paris in the summer of 1793. On the highest hill in the city, Claude Chappe and his brothers built a wooden tower with arms that move. Each way the arms point stands for a signal. Far away, another tower watches through a telescope and copies the signal. Look at the old picture of their test. Today you'll measure long distances in kilometers and meters.",
'think-1':"Before the test, a messenger runs a note from the workshop up to the tower. The path is one thousand nine hundred meters long. Build it out of hundred-meter pieces, and watch what happens at ten.",
'think-done':"You did it! Ten pieces of one hundred meters made one kilometer. Nine more pieces made nine hundred meters. So one thousand nine hundred meters is one kilometer nine hundred meters.",
'learn-1':"Welcome to the Lesson. First, Claire shows how meters build up to kilometers. Next, we fix some mix-ups. Then you work on your own.",
'practice-1':"Each job has a mix-up kids often make. Here's a clue. A kilometer is one thousand meters, not one hundred. And always compare in the same unit.",
'own-1':"Your turn to work on your own. Find the thousands first. Those are the kilometers.",
'swyk-1':"Last stop! A message has to reach three stops along a road. Move it to each one, and say how far it went.",
'end-1':"Here's music from about the same time as the towers. It's a slow part of a symphony by Wolfgang Amadeus Mozart, written in 1780. Listen to the strings, soft and smooth, like a signal passing from tower to tower. Press play, and stop whenever you like.",
}
V=[
("opti","Hoo! Claire is going to show us how meters add up to kilometers. Watch the road grow."),
("claire","Here is a road made of pieces. Each piece is one hundred meters long. Let's count by hundreds: one hundred, two hundred, three hundred, and so on, all the way to one thousand. Ten pieces of one hundred meters make one thousand meters. One thousand meters is one kilometer. A kilometer is about a fifteen-minute walk. Now let's build a longer road, three thousand four hundred meters long. Every ten pieces make a kilometer, so we have three kilometers. Four pieces are left over. That's four hundred meters. Three thousand four hundred meters is three kilometers four hundred meters."),
("claire","To go the other way, think of every kilometer as one thousand meters. Three kilometers four hundred meters is three thousand meters and four hundred meters, so three thousand four hundred meters."),
("claire","Watch out! A kilometer is not one hundred meters. Six kilometers is six thousand meters, not six hundred meters."),
("opti","Ten hundreds make a thousand, and a thousand meters make a kilometer. Now it's your turn!"),
]
K="Kilometer. ... Distance. ... Travel distance. ... Direct distance."
on=sum(len(v) for v in O.values()); op=sum(len(t) for s,t in V if s=='opti'); clc=len(' '.join(t for s,t in V if s=='claire'))
for k,v in O.items(): print(k,len(v))
print('notes',on,'opti vid',op,'claire',clc,'words',len(K),'total',on+op+clc+len(K), 'pct', round((on+op+clc+len(K))/2900*100,1))
