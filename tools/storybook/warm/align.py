# python align.py clip.mp3 "script" out.json  -> word times (pocketsphinx forced alignment, no credits)
import sys, json, re, subprocess
from pocketsphinx import Decoder
mp3, script, out = sys.argv[1:4]
raw = subprocess.run(['ffmpeg','-v','error','-i',mp3,'-ac','1','-ar','16000','-f','s16le','-'],capture_output=True).stdout
NUM={'2,500':'two thousand five hundred','9':'nine'}
disp = script.split()
spoken=[]
for w in disp:
    k=w.strip('.,!?;:\'"')
    s=NUM.get(k, re.sub(r"[^a-z' -]","",w.lower().replace('-',' ')))
    spoken.append(s.split())
flat=[t for s in spoken for t in s]
d = Decoder(samprate=16000, bestpath=False)
PH={'opti':'AA P T IY','hoo':'HH UW','pythagoras':'P IH TH AE G ER AH S','numerators':'N UW M ER EY T ER Z','numerator':'N UW M ER EY T ER'}
for t in set(flat):
    if d.lookup_word(t) is None:
        assert t in PH, 'add phones for '+t
        d.add_word(t, PH[t], True)
d.set_align_text(' '.join(flat))
d.start_utt(); d.process_raw(raw, full_utt=True); d.end_utt()
seg=[(s.word,s.start_frame/100,(s.end_frame+1)/100) for s in d.seg()]
seg=[s for s in seg if s[0] not in ('<s>','</s>','<sil>','sil','[NOISE]','(NULL)')]
seg=[(re.sub(r'\(\d+\)$','',w),a,b) for w,a,b in seg]
assert len(seg)==len(flat),(len(seg),len(flat),seg[-5:])
i=0; words=[]
for w,s in zip(disp,spoken):
    part=seg[i:i+len(s)]; i+=len(s)
    words.append({'w':w,'t':round(part[0][1],2),'e':round(part[-1][2],2)})
dur=float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',mp3],capture_output=True,text=True).stdout)
json.dump({'dur':dur,'words':words},open(out,'w'))
print(dur, ' '.join(f"{x['w']}@{x['t']}" for x in words))
