# nicodump
a niconico live dump tool.

## usage

A valid niconico live cookie is required to using this tool. You can export your niconico live cookies with this chrome extension [cookies.txt](https://chrome.google.com/webstore/detail/njabckikapfpffapmjgojcnbfjonfjfg). 

```
node . -c cookies.txt lv321155376 
```

This tool will export the hls link and it is possible to dump the vide with streamlink(https://github.com/streamlink/streamlink)

```
streamlink <hls-url> best -o dump.ts

# or ffmpeg
ffmpeg -i <hls-url> -c copy dump.ts

```