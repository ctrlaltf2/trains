# subscriber.py
import paho.mqtt.client as mqtt
import paho.mqtt.publish as publish
import paho.mqtt.subscribe as subscribe

import time

class mqttHW(mqtt.Client):
    def __init__(self):
        super().__init__()
        self.recieve_data = ""
        self.recieve_time = ""
        self.lasttime     = ""
        self.broker = "broker.hivemq.com"
        self.channel = 8000
        self.on_connect()
        
    def on_connect(self, mqttc, obj, flags, rc):
        # print("rc: "+str(rc))
            client = mqtt.Client()
            client.on_connect = self.on_connect
            client.connect(self.broker, self.channel)
            self.subscibe = subscribe("trains/brake")
        

    def on_message(self, mqttc, obj, msg):
            print(msg.topic + " " + str(msg.payload))
            self.recieve_time = time.time()
            self.recieve_data = (msg.payload).decode()


    def run(self, topic):
        self.connect(self.broker, 1883, 60)
        self.subscribe(topic, 0)

        self.loop_start()
        
        rc = 0

        return rc


    def publish_message(self, topic, msg):
        publish.single(topic, msg, self.broker)


    def isNew(self):
        flag = False
        if self.lasttime == self.recieve_time: flag =  False
        else: flag = True
        self.lasttime = self.recieve_time
        return flag

    def getRdata(self):
        return self.recieve_data




# If you want to use a specific client id, use
# mqttc = MyMQTTClass("client-id")
# but note that the client id must be unique on the broker. Leaving the client
# id parameter empty will generate a random id for you.
mqttc = MyMQTTClass("Trains")
rc = mqttc.run("localhost","testTopic1")

print("rc: "+str(rc))

i=0
while(1):
    i+=1
    print(i)
    mqttc.publish_message("localhost", "testTopic2",i)
    
    if mqttc.isNew(): print(mqttc.recieve_data)


    def run(self):
        client.on_connect = self.on_connect
        client.on_message = self.on_message
        client.on_publish = self.on_publish
        client.on_subscribe = self.on_subscribe