# subscriber.py
import paho.mqtt.client as mqtt

import time

##########
# connect to server
# subscribe to topics
# 
# make into a class 
# add decode fucntion
# add IO
# incorporate PID

class pubsub:

    def __init__(self):
        self.topic = "xxx"
        def connect() -> mqtt:
            def on_connect(client, userdata, flags, rc):
                if rc == 0:
                    print("Connected to Broker!")
                else:
                    print("Failed to connect, returned code %d\n", rc)

            client = mqtt.Client()
            client.on_connect = on_connect
            client.connect("broker.hivemq.com", 8000)
            self.subscibe = subscribe 
            
            return client

    
    def subscribe(self, client: mqtt, topic):
        def on_message(client, userdata, msg):
            print(f"Received `{msg.payload.decode()}` from `{msg.topic}` topic")
            self.topic = topic
            client.subscribe(self.topic)
            client.on_message = on_message


    
    def publish(self, topic, msg2send):
        while True:
            time.sleep(1)
            result = self.client.publish(topic, msg2send)
            # result: [0, 1]
            status = result[0]
            if status == 0:
                print(f"Send `{self.msg2send}` to topic `{topic}`")
            else:
                print(f"Failed to send message to topic {topic}")



    def decode(self, msg):
        if (msg.topic == "trains/power"):
            if "power" in msg.topic:
                #updateSpeed(msg.payload)
                #call power
                #todo 
                pass

            elif (msg.topic == "trains/lights"):
                if "lights" in msg.topic:
                    #call lights
                    #todo
                    pass
        #the rest
            #todo
            # 

    
    def run(self):
        client = self.connect()
        client.loop_start()
        self.publish(client)




