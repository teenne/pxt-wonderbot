// Compiled by MakeCode as a check that the blocks build; it only runs with wonderbot-microbit on the Pi.
input.onButtonPressed(Button.A, function () {
    wonderbot.setLight("dash-01", WonderLight.All, 0x00ff00)
    wonderbot.drive("dash-01", WonderDirection.Forward, 20)
    wonderbot.turn("dash-01", WonderSide.Left, 90)
    wonderbot.driveFor("dash-01", 50, 20, 2)
    wonderbot.head("dash-01", 30, -10)
    wonderbot.playSound("dash-01", "SYSTBIRTHDAY")
    if (wonderbot.lastError() != "") basic.showString(wonderbot.lastError())
})
input.onButtonPressed(Button.AB, function () {
    wonderbot.stopAll()
})
