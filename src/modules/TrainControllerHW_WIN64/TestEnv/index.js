const mqtt = require('mqtt');
//must init npm prior
//all code is in the index File
//this will prolly need added to his json file

//get publilshing working

//get PID PIDing w/ curr and setPT
    //needs to constantly be calculating
    //model off prem and auris

//test to feed inputs


//for msg handling
// inQ = new Array();
// outQ = new Array();

//for connection purposes
const websocketUrl = "mqtt://broker.hivemq.com";
const topic = 'trains/vitals'
const host = 'broker.hivemq.com';


const client = mqtt.connect(websocketUrl);

//sub to topic
client.subscribe(topic); //not including power


client.on('connect', () => {
  console.log('Connected')
  client.subscribe([topic], () => {
    console.log(`Subscribe to topic '${topic}'`)
  })
  client.publish(topic, 'nodejs mqtt test', { qos: 0, retain: false }, (error) => {
    if (error) {
      console.error(error)
    }
  })
})


client.on('message', (topic, payload) => {
  console.log('Received Message:', topic, payload.toString())
})

// function on_connect(client) {
  
//     //client.subscribe(//power);
//     //client.subscribe(//externals);

// }

// function on_message(client) {
//     client.on("message", (topic,message,packet) => {
//         console.log(new TextDecoder("utf-8").decode(message));
// }



//     // client.on("message", (topic, message, packet) => {
//     //     callBack(JSON.parse(new TextDecoder("utf-8").decode(message)));
//     //   });
//     }