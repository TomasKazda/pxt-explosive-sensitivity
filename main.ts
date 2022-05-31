radio.setGroup(38)
radio.setTransmitPower(7)
let myId = 0

music.setVolume(255)
input.setAccelerometerRange(AcceleratorRange.TwoG)
let accxn = 0
let accyn = 0
let accsn = 1048
let deltaxy = 66
let deltas = 20
let deltamodifier = 1 //1 = 100% 2 = 200% ...
let booom = true
let radiocast = false
let stop = true

let reset = ():void => {
    stop = true
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
    stop = false
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
    if (!stop)
    {
        let accx = input.acceleration(Dimension.X)
        let accy = input.acceleration(Dimension.Y)
        let accz = input.acceleration(Dimension.Z)
        let accs = input.acceleration(Dimension.Strength)
        let xaxis = Math.idiv(accx - accxn, deltaxy * deltamodifier)
        let yaxis = Math.idiv(accy - accyn, deltaxy * deltamodifier)
        let xyzacc = Math.idiv(Math.abs(accs - accsn), deltas * deltamodifier)

        if (accz > -512) booom = true //face down orientation
        if (xyzacc > 9) booom = true //shake it, baby
        if (Math.abs(xaxis) > 2 || Math.abs(yaxis) > 2) booom = true //on an inclined surface

        if (booom && !stop) {
            if (radiocast) {
                radio.sendNumber(myId)
                radio.sendNumber(myId + 10)
            }
            stop = true
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
    radiocast = false
    reset()
})

input.onButtonPressed(Button.A, function() {
    radiocast = !radiocast
    if (radiocast)
    {
        stop = true
        basic.showLeds(`
          # # # # #
          . # # # .
          . . # . .
          . # # # .
          # # # # #
        `)
        radio.sendNumber(myId)
    } else {
        reset()
    }
})

radio.onReceivedNumber(function(receivedNumber: number) {
    //start game
    if (receivedNumber == 99 && radiocast)
    {
        radio.sendNumber(myId)
        reset()
    }
    //finished KO
    if (receivedNumber == 100 && radiocast && booom) {
        stop = true
        radio.sendNumber(myId)
        radio.sendNumber(myId + 10)
        basic.showIcon(IconNames.Sad, 0)
        soundExpression.sad.playUntilDone()
    }
    //finished OK
    if (receivedNumber == 100 && radiocast && !booom) {
        stop = true
        radio.sendNumber(myId)
        basic.showIcon(IconNames.Happy, 0)
        soundExpression.happy.playUntilDone()
    }
    //set deltamodifier
    if (receivedNumber >= 20 && receivedNumber <= 40 && booom) {
        let newdelta = 1 + ((receivedNumber - 22) / 10)
        deltamodifier = newdelta
        basic.showNumber(deltamodifier*100, 100)
    }
    
})

/*

Rozbuška
-	Dlouhé podržení „loga" - Začátek hry (jedno zařízení nezávisle)
-	A button - přepínač mezi „dálkovým" ovládáním a lokální hrou
Rozbuška – dálkové ovládání
-	A button - zvyšuje obtížnost (tolerance 80 %–280 %)
-	B button - snižuje obtížnost (tolerance 80 %–280 %)
-	Stisk „loga" - odeslání obtížnosti (neaktivním) rozbuškám
-	Stisk a puštění A+B tlačítka zároveň - Synchronizovaný (dálkový) start
-	Dlouhé podržení „loga" - Synchronizovaný (dálkový) stop
Poznámky
Po zobrazení odpočtu 3, 2, 1 následuje 0,5 s dlouhé „okno", kdy je nutné mít micro:bit zcela v klidu (klidně položený) a ve vodorovné poloze! Zjišťuje se „výchozí klidový" stav.


*/