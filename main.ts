music.setVolume(64)
input.setAccelerometerRange(AcceleratorRange.TwoG)
let accxn = 0
let accyn = 0
let accsn = 1048
let deltaxy = 66
let deltas = 20
let booom = true

let reset = ():void => {
    basic.showNumber(3, 200)
    basic.showNumber(2, 200)
    basic.showNumber(1, 200)
    let accx = input.acceleration(Dimension.X)
    let accy = input.acceleration(Dimension.Y)
    let accs = input.acceleration(Dimension.Strength)
    for (let i = 0; i < 5; i++) {
        basic.pause(100)
        accx += input.acceleration(Dimension.X)
        accy += input.acceleration(Dimension.Y)
        accs += input.acceleration(Dimension.Strength)
    }
    accxn = Math.idiv(accx, 6)
    accyn = Math.idiv(accy, 6)
    accsn = Math.idiv(accs, 6)
    soundExpression.slide.playUntilDone()
    clear()
    booom = false
}

let clear = ():void => {
    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            led.unplot(x, y)
        }
    }
}

basic.forever(function () {
    if (!booom)
    {
        let accx = input.acceleration(Dimension.X)
        let accy = input.acceleration(Dimension.Y)
        let accz = input.acceleration(Dimension.Z)
        let accs = input.acceleration(Dimension.Strength)
        let xaxis = Math.idiv(accx - accxn, deltaxy)
        let yaxis = Math.idiv(accy - accyn, deltaxy)
        let xyzacc = Math.idiv(Math.abs(accs - accsn), deltas)

        if (accz > -512) booom = true //face down orientation
        if (xyzacc > 9) booom = true //shake it, baby

        if (booom) {
            basic.showIcon(IconNames.Sad, 0)
            soundExpression.sad.playUntilDone()
        } else {
            control.inBackground(function() {
                for (let i = 2; i < xyzacc / 2; i++) {
                    music.playTone(494, 50)
                    music.rest(75)
                }
            })

            clear()
            led.plot(2 + xaxis, 2 + yaxis) 
        }
    }
    basic.pause(100)
})

// control.inBackground(function() {
//     let delaymin = 75
//     let tonemin = 50
//     let shift = Math.constrain(10 - toneshift, 0, 10)
//     basic.forever(function () {
//         if (!booom)
//         {
//             shift = Math.constrain(10 - toneshift, 0, 10)
//             music.playTone(440, tonemin + 40 * shift)
//             music.rest(delaymin + 80 * shift)
//         }
//     })
// })

input.onLogoEvent(TouchButtonEvent.LongPressed, function() {
    booom = true
    reset()
})

reset()