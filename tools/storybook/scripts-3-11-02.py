O={
'warm-1':"Hoo! It's the day after we saw the marble meter. Now we're in a ribbon shop in Paris. The rolls of ribbon are measured in whole meters. But customers ask for pieces in centimeters. Look at the old picture of a busy Paris shop, full of ribbons and cloth. Today you'll cut pieces off whole meters and find out how much is left.",
'think-1':"Here's the first order. The roll has nine whole meters. The customer wants forty-seven centimeters. You can't cut centimeters from a whole meter, so break one meter first.",
'think-done':"Well done! You broke one meter into one hundred centimeters. You cut off forty-seven, and fifty-three were left. Eight whole meters are still on the roll. So eight meters fifty-three centimeters remain.",
'learn-1':"Welcome to the Lesson. First, Claire shows two ways to take centimeters away from meters. Next, we fix some mix-ups. Then you cut an order on your own.",
'practice-1':"Each job has a mix-up kids often make. Here's a clue. Break only one meter, and keep the other meters. Then check by adding back.",
'own-1':"Your turn to work on your own. Take away the meters first. Then break a meter for the centimeters.",
'swyk-1':"Last stop! The orders are coming in. Cut each one from the roll, and say what's left.",
'end-1':"The shop is closing for the night. Listen to music by Joseph Haydn, first played in London in 1792. It's soft and quiet, and then, surprise, one big loud chord! Stories say he wanted to wake up sleepy listeners. Press play, and stop whenever you like.",
}
V=[
("opti","Hoo! Claire is going to show us how to take centimeters away from meters. Watch the meter break."),
("claire","A ribbon roll has nine meters. A customer wants twenty-eight centimeters. We can't take centimeters from a whole meter. So break one meter into one hundred centimeters. Now we have eight meters and one hundred centimeters. Take twenty-eight from the hundred. Count up from twenty-eight: two more makes thirty, and seventy more makes one hundred. Two and seventy is seventy-two. So seventy-two centimeters are left, and the eight meters are still there. Nine meters minus twenty-eight centimeters is eight meters seventy-two centimeters."),
("claire","Here's another way. Take away one whole meter. That leaves eight meters. But we only needed twenty-eight centimeters, so we took too much. Give back the extra seventy-two centimeters. Eight meters and seventy-two centimeters again."),
("claire","Watch out! Don't forget to break a meter. Nine meters minus twenty-eight centimeters is not nine meters seventy-two centimeters. One of the nine meters was broken, so only eight are left."),
("opti","Break one meter, keep the rest, and check by adding back. Now it's your turn!"),
]
K="Subtract. ... Remaining. ... Break a meter. ... Compound units."
on=sum(len(v) for v in O.values()); op=sum(len(t) for s,t in V if s=='opti'); clc=len(' '.join(t for s,t in V if s=='claire'))
for k,v in O.items(): print(k,len(v))
print('notes',on,'opti vid',op,'claire',clc,'words',len(K),'total',on+op+clc+len(K), 'pct', round((on+op+clc+len(K))/2900*100,1))
