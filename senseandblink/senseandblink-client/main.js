// Rick Candell
// NIST
// Public Domain

"use strict" ;

// MRAA, as per usual
var mraa = require('mraa');

// TI ADS1015 on ADC Block (http://www.ti.com.cn/cn/lit/ds/symlink/ads1015.pdf)
var adc = new mraa.I2c(1);
adc.address(0x48);

// Read from ADC and return voltage
adc.readADC = function(channel) {

    // The ADC Block can't have more than 4 channels
    if (channel <= 0) {
        channel = 0;
    }
    if (channel >= 3) {
        channel = 3;
    }

    // We will use constant settings for the config register
    var config = 0;                 // Bits     Description
    config |= 1 << 15;              // [15]     Begin a single conversion
    config |= 1 << 14;              // [14]     Non-differential ADC
    config |= channel << 12;        // [13:12]  Choose a channel
    config |= 1 << 9;               // [11:9]   +/-4.096V range
    config |= 1 << 8;               // [8]      Power-down, single-shot mode
    config |= 4 << 5;               // [7:5]    1600 samples per second
    config &= ~(1 << 4);            // [4]      Traditional comparator
    config &= ~(1 << 3);            // [3]      Active low comparator polarity
    config &= ~(1 << 2);            // [2]      Non-latching comparator
    config |= 3;                    // [1:0]    Disable comparator

    // Write config settings to ADC to start reading
    this.writeWordFlip(0x01, config);

    // Wait for conversion to complete
    while (!(this.readWordFlip(0x01) & 0x8000)) {
    }

    // Read value from conversion register and shift by 4 bits
    var voltage = (adc.readWordFlip(0x00) >> 4);

    // Find voltage, which is 2mV per incement
    voltage = 0.002 * voltage;

    return voltage
};

// The ADS1015 accepts LSB first, so we flip the bytes
adc.writeWordFlip = function(reg, data) {
    var buf = ((data & 0xff) << 8) | ((data & 0xff00) >> 8);
    return this.writeWordReg(reg, buf);
};

// The ADS1015 gives us LSB first, so we flip the bytes
adc.readWordFlip = function(reg) {
    var buf = adc.readWordReg(reg);
    return ((buf & 0xff) << 8) | ((buf & 0xff00) >> 8);
};

// Set up a digital output on MRAA pin 20 (GP12)
var ledPin = new mraa.Gpio(20); // create an object for pin 20
ledPin.dir(mraa.DIR_OUT);  // set the direction of the pin to OUPUT

// setup interval holders
var intervalIDLightSensor;
var intervalIDLed;

// now we are going to read the analog input at a periodic interval
// connect a jumper wire to the sampled analog input and touch it to
// a +1.8V, +3.3V, +5V or GND input to change the value read by the analog input

var BlinkFastMs = 100;
var BlinkSlowMs = 500;

var analogIn ;
var lightThreshold = 0.5;
var lightSensorState = 1;  // 1 = above threshold, 0 = below
var readLightSensor = function() {
    // Read light sensor (on ADC1)
    var v1 = adc.readADC(1);
    //process.stdout.write(v1 + " ") ;          // write a stream of analog values to the console    
    if ((!lightSensorState) && (v1>lightThreshold)){
        console.log("changing to fast")
        lightSensorState = 1;
        clearInterval(intervalIDLed);
        intervalIDLed = setInterval(writeLed, BlinkFastMs) ;  // start the periodic read
    }
    else if ((lightSensorState) && (v1<lightThreshold)){
        console.log("changing to slow")
        lightSensorState = 0;
        clearInterval(intervalIDLed);
        intervalIDLed = setInterval(writeLed, BlinkSlowMs) ;  // start the periodic read
    }
};

// global variable for pin state
var ledState = 0;
function writeLed() 
{
    // toggle state of led
    ledState = (ledPin.read()?0:1);
    // set led value
    ledPin.write(ledState);
}

// setup perdiodic activity for light sensor reading
intervalIDLightSensor = setInterval(readLightSensor, 500) ;  // start the periodic read
intervalIDLed = setInterval(writeLed, BlinkFastMs) ;  // start the periodic read

