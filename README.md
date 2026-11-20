# Wonderbot blocks for MakeCode (micro:bit)

Blocks that drive Wonder Workshop Dash and Cue robots from a micro:bit program. The micro:bit does not talk to the
robots itself: it sends each block over USB serial to `wonderbot-microbit` on the Raspberry Pi, which passes it to the
gateway that holds the robots. The gateway keeps its checks: bounded moves, stops on stall, IR obstacles and stale
data, and only allowed light and sound commands.

## Blocks

| Block | Does |
| --- | --- |
| drive ROBOT forward/backward CM cm | drive straight (1-100 cm), wait until it has stopped |
| turn ROBOT left/right DEG degrees | turn on the spot, wait until it has stopped |
| drive ROBOT with speed S turn R for T s | speed and turn rate -100..100 %, for up to 10 s, then stop |
| set ROBOT chest/ears/head/all light to COLOR | lights |
| play sound NAME on ROBOT | a robot sound by name, for example `SYSTBIRTHDAY` (Dash names are silent on Cue) |
| point ROBOT head pan P tilt T | head angles in degrees |
| stop all robots | stop every robot in the gateway |
| last error | why the last block failed, empty if it worked |

Robots are named by their alias on the Pi (`dash-01`, `cue-02`, ...). Each block waits for the Pi's answer (at most
30 s); a failed block sets `last error` and the program goes on.

## Use

1. In MakeCode for micro:bit: Extensions → paste `https://github.com/teenne/pxt-wonderbot`.
2. Download the program to a micro:bit that is plugged into the Pi.
3. On the Pi, start the gateway and the bridge for the robots the program uses:

```bash
pi/with-gateway.sh dash-01 -- python3 -m wonderbot.microbit dash-01
```

The protocol (one line `W SEQ CMD ARGS` per block, answers `A SEQ` or `E SEQ REASON`) is described in
`src/wonderbot/microbit.py` in the wonderbot repo, which also has the Pi side (gateway and bridge); it is not
public yet. Do not write anything else to the serial port in the same program: other lines are
ignored by the Pi, but the Pi's answers are read by these blocks.

## Note

Not affiliated with or endorsed by Wonder Workshop. Dash, Cue and Dot are their trademarks. The blocks are developed
here. After a change: raise the version in `pxt.json` and tag a GitHub release `vX.Y.Z` (MakeCode loads the newest
release). If the serial protocol changes, change `src/wonderbot/microbit.py` in wonderbot in step.
