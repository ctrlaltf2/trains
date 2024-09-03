import mqtt from "mqtt";

//for msg handling
// inQ = new Array();
// outQ = new Array();

//for connection purposes
const websocketUrl = "ws://broker.hivemq.com";
const client = mqtt.connect(websocketUrl);
const topic = 'train/vitals'

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