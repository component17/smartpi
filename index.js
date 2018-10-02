const GPIO = require("gpio");
const socket = require('socket.io-client')('http://soback.jelastic.regruhosting.ru/?device=actuator&token=27122712');

let gpio = {};
let devices = [];

socket.on('connect', function(){
    console.log('connected')
});

socket.on('initActuator', (data) => {
    devices = data;

    registerGPIO(data, () => {
        socket.emit('actuatorReady')
    });
});

socket.on('setGPIO', ({namespace, value}) => {
    setGPIO(namespace, value);
});

function registerGPIO(devices, cb){
    for(let item of devices){
        gpio[item.namespace] = GPIO.export(item.gpio, {
            direction: GPIO.DIRECTION.OUT,
            ready: () => {
                setGPIO(item.namespace, item.default);

                gpio[item.namespace].on("change", (val) => {
                    let value;

                    if(val === 0){
                        value = false
                    }

                    if(val === 1){
                        value = true
                    }

                    socket.emit('updateGPIO', {namespace: item.namespace, value})
                });
            }
        });
    }

    cb();
}

function setGPIO(key, val){
   gpio[key].set(val ? 1 : 0);
}
