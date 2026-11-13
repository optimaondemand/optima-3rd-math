# Warm-Up films (Opti, no new credits)

Each storybook lesson's Warm-Up film plays Opti's already-recorded `warm-1` note
(`audio/storybook/g3m-3-09-LL-warm-1.mp3`) over pictures drawn in `warm.html`.

Build in the cloud container (repo files copied to `../repo/`):

1. `pip install pocketsphinx` then
   `python align.py ../repo/audio/storybook/g3m-3-09-LL-warm-1.mp3 "<warm-1 script>" wN.json`
   (forced alignment, free; add phones to `PH` for new names).
2. Add the lesson's scene to `SC[...]` and its cue words to `CUES[...]` in `warm.html`.
3. `node render.js 3.09.LL wN.json check 2,5,9` to look at frames, then `node render.js 3.09.LL wN.json 20`.
4. `ffmpeg -framerate 20 -i frames-3.09.LL/f%05d.jpg -i <warm-1.mp3> -filter_complex "[1:a]adelay=600|600,apad[a]" -map 0:v -map "[a]" -t <dur+1.8> -c:v libx264 -pix_fmt yuv420p -crf 26 -preset slow -movflags +faststart -c:a aac -b:a 96k g3math-09-LL-warm.mp4`
5. Poster = frame 52 (the open book). Files go in `assets/video/g3math-UU-LL-warm.mp4/.jpg`.

Rules: show the story and the idea, never an answer the page asks for, and never the Think job's numbers.
