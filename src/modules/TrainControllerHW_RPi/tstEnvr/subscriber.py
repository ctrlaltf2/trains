# subscriber.py

#import libraries
import paho.mqtt.client as mqtt
import time
from simple_pid.pid import PID as PID

#initialize
lastpower = 0
power = 0
currentSpeed = 0
currentAuthority = 100
maxspeed = 100
setpt = 0

#define functions
def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    # subscribe to all needed topics, which need to put into on_connect
    
    client.subscribe("trains/currentSpeed")
    client.subscribe("trains/NewAuthority")
    client.subscribe("trains/NewSetpoint")

# the callback function, it will be triggered when receiving messages
def on_message(client, userdata, msg):
    #print(f"{msg.topic} {msg.payload}")
    #print("payload is " + str(int(msg.payload)))
    
    if(msg.topic == "trains/currentSpeed"):
        change_speed(int(msg.payload))
        
    elif(msg.topic == "trains/NewAuthority"):
        change_authority(int(msg.payload))
        
    elif(msg.topic == "trains/NewSetpoint"):
        change_setpoint(int(msg.payload))
        

def change_speed(receivedCurrentSpeed):
    global currentSpeed
    print("changing curreent speed to " + str(int(receivedCurrentSpeed)))
    currentSpeed = int(receivedCurrentSpeed)

def change_authority(receivedCurrentAuthority):
    global currentAuthority
    print("changing current authority to " + str(int(receivedCurrentAuthority)))
    currentAuthority = int(receivedCurrentAuthority)
    
def change_setpoint(receivedNewSetpoint):
    global setpt
    print("changing new setpoint to " + str(int(receivedNewSetpoint)))
    setpt = int(receivedNewSetpoint)

def calc_power():
    global currentAuthority 
    global currentSpeed
    global power
    global lastpower
    global setpt
    lastpower = power
    pid = PID(1.0, 1.5, 0.0, setpoint = setpt)
    power = pid(lastpower)
    
        
        
def display_vitals():
    print("-----------Vitals---------- ")
    print("Current speed is " + str(int(currentSpeed)))
    print("Current Authority is " + str(int(currentAuthority)))
    print("Current Setpoint is " + str(int(setpt)))
    


client = mqtt.Client()
client.on_connect = on_connect

client.on_message = on_message

# set the will message, when the Raspberry Pi is powered off, or the network is interrupted abnormally, it will send the will message to other clients
client.will_set('trains', b'{"status": "Off"}')

# create connection, the three parameters are broker address, broker port number, and keep-alive time respectively
client.connect("broker.hivemq.com", 1883, 8000)
client.loop_start()
display_vitals()

while True:
    if (currentAuthority % 10 == 0):
        display_vitals()
        
    client.publish("trains/power", "Remaining Authority: " + str(currentAuthority))
    calc_power()
    client.publish("trains/power", "last power input was: " + str(lastpower))
    client.publish("trains/power", "Power is: " + str(power))
    print("Prev power was: " + str(lastpower))
    print("Power is: " + str(power))
    currentAuthority = currentAuthority - 1
    time.sleep(5)
# set the network loop blocking, it will not actively end the program before calling disconnect() or the program crash
#client.loop_forever()
