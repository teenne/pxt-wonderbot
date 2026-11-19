// Blocks that send one line "W SEQ CMD ARGS" over USB serial to wonderbot-microbit on the Pi and wait for its
// answer "A SEQ" (done) or "E SEQ REASON". The protocol is in src/wonderbot/microbit.py; the Pi's gateway checks
// every request (bounded moves, stall and obstacle stops, allowed light and sound commands).

enum WonderDirection {
    //% block="forward"
    Forward,
    //% block="backward"
    Backward
}

enum WonderSide {
    //% block="left"
    Left,
    //% block="right"
    Right
}

enum WonderLight {
    //% block="chest"
    Chest,
    //% block="ears"
    Ears,
    //% block="head"
    Head,
    //% block="all"
    All
}

//% color="#0096d6" weight=100 icon="" block="Wonderbot"
namespace wonderbot {
    const TIMEOUT_MS = 30000
    let seq = 0
    let started = false
    let answered = -1
    let error = ""

    function start(): void {
        if (started) return
        started = true
        serial.redirectToUSB()
        serial.setBaudRate(BaudRate.BaudRate115200)
        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
            const parts = serial.readUntil(serial.delimiters(Delimiters.NewLine)).trim().split(" ")
            if (parts.length >= 2 && (parts[0] == "A" || parts[0] == "E")) {
                error = parts[0] == "E" ? parts.slice(2).join(" ") : ""
                answered = parseInt(parts[1])
            }
        })
    }

    // shortcut: one answer slot, so blocks running at the same time in several event handlers can miss their
    // answer and wait for the timeout; give each call its own slot if programs need parallel robots
    function call(cmd: string): void {
        start()
        seq = (seq + 1) % 10000
        const mine = seq
        serial.writeLine("W " + mine + " " + cmd)
        const t0 = control.millis()
        while (answered != mine && control.millis() - t0 < TIMEOUT_MS) basic.pause(20)
        if (answered != mine) error = "no answer from the Pi"
    }

    function hex6(c: number): string {
        const digits = "0123456789abcdef"
        let s = ""
        for (let shift = 20; shift >= 0; shift -= 4) s += digits.charAt((c >> shift) & 15)
        return s
    }

    /**
     * Drive straight and wait until the robot has stopped.
     * @param robot robot name, eg: "dash-01"
     * @param cm distance in cm, eg: 20
     */
    //% block="drive $robot $direction $cm cm"
    //% robot.defl="dash-01" cm.min=1 cm.max=100 cm.defl=20
    //% weight=100
    export function drive(robot: string, direction: WonderDirection, cm: number): void {
        call("D " + robot + " " + (direction == WonderDirection.Forward ? cm : -cm))
    }

    /**
     * Turn on the spot and wait until the robot has stopped.
     * @param robot robot name, eg: "dash-01"
     * @param degrees angle, eg: 90
     */
    //% block="turn $robot $side $degrees degrees"
    //% robot.defl="dash-01" degrees.min=1 degrees.max=360 degrees.defl=90
    //% weight=90
    export function turn(robot: string, side: WonderSide, degrees: number): void {
        call("T " + robot + " " + (side == WonderSide.Left ? degrees : -degrees))
    }

    /**
     * Drive with a speed and a turn rate for a time, then stop. Both at once drive a curve.
     * @param robot robot name, eg: "dash-01"
     * @param speed forward speed in percent, negative = backward, eg: 50
     * @param turnRate turn rate in percent, positive = left, eg: 0
     * @param seconds how long, at most 10, eg: 2
     */
    //% block="drive $robot with speed $speed turn $turnRate for $seconds s"
    //% robot.defl="dash-01" speed.min=-100 speed.max=100 speed.defl=50
    //% turnRate.min=-100 turnRate.max=100 seconds.min=0.1 seconds.max=10 seconds.defl=2
    //% weight=80
    export function driveFor(robot: string, speed: number, turnRate: number, seconds: number): void {
        call("J " + robot + " " + speed + " " + turnRate + " " + seconds)
    }

    /**
     * Set a light on the robot.
     * @param robot robot name, eg: "dash-01"
     */
    //% block="set $robot $light light to $color"
    //% robot.defl="dash-01" color.shadow="colorNumberPicker"
    //% weight=70
    export function setLight(robot: string, light: WonderLight, color: number): void {
        const parts = ["chest", "ears", "head", "all"]
        call("C " + robot + " " + parts[light] + " " + hex6(color))
    }

    /**
     * Play one of the robot's sounds by name.
     * @param robot robot name, eg: "dash-01"
     * @param sound sound name, eg: "SYSTBIRTHDAY"
     */
    //% block="play sound $sound on $robot"
    //% robot.defl="dash-01" sound.defl="SYSTBIRTHDAY"
    //% weight=60
    export function playSound(robot: string, sound: string): void {
        call("P " + robot + " " + sound)
    }

    /**
     * Point the robot's head.
     * @param robot robot name, eg: "dash-01"
     * @param pan degrees, positive = the robot's right, eg: 0
     * @param tilt degrees, negative = up, eg: 0
     */
    //% block="point $robot head pan $pan tilt $tilt"
    //% robot.defl="dash-01" pan.min=-120 pan.max=120 tilt.min=-24 tilt.max=7
    //% weight=50
    export function head(robot: string, pan: number, tilt: number): void {
        call("H " + robot + " " + pan + " " + tilt)
    }

    /**
     * Stop every robot at once.
     */
    //% block="stop all robots"
    //% weight=40
    export function stopAll(): void {
        call("S")
    }

    /**
     * Why the last block failed, or empty if it worked.
     */
    //% block="last error"
    //% weight=30
    export function lastError(): string {
        return error
    }
}
