######################################### SYSTEM LIBS ##################################################################################   
import time
import sys
import string
from simple_pid import PID

######################################### CONNECTION LIBRARY ##################################################################################   

import paho.mqtt.client as mqtt

######################################### GPIO LIBRARIES ##################################################################################################################################


from gpiozero import LED, Button, RGBLED, DigitalInputDevice
from colorzero import Color  
import RPi.GPIO as GPIO


################### TODO ###################
#make PID class use engine.py


class InOut():
    
    def __init__(self,
                #TrainModel
                cmdV =  0.0,
                currV = 0.0,
                auth =  0.0,
                IDnum = "TCHW0",
                autoMode = True,
                timeInt = .1):
                    
        ########################## VITAL GPIO INFO ###################
        #self.gpioguy = GPIOTC()            #all IO used to be in different class but IO integration is easier this way
        
        self.brake = LED(4)                 #pin 4
        self.Ebrake = LED(17)               #pin 17
        self.brakeFailled = LED(5)          #pin 4
        self.engineFailled = LED(16)        #pin 17    
        self.signalFialled = LED(6)         #pin 4
        self.autoLED = LED(23)
        self.autoButton = Button(24)
        self.timeInt = timeInt
        self.autoMode = autoMode
        
        ########################## NONVITAL GPIO INFO ###################
        self.doorsL = LED(27)
        self.doorsR = LED(22)
        self.inLights = LED(20)
        self.exLights = LED(19)
        
     ######################## nonvitals #####################

        self.comingUp = False
        self.atStation = False
        self.stationDL = False
        self.stationDR = False
        self.stationName = ""
        self.announce = ""
        self.temp = 68
        self.authLimit = 888
        
        ######################## VITAL POWER SET UP INFO ########################
        self.AnteayerV = 0.0 # T-2
        self.prevV = 0.0     # T-1
        self.currV = currV   # T  
        self.manCmdV = 0.0     
        self.cmdV = cmdV
        self.auth = auth
        self.allowedError = 5

######################## OPERATING POWER INFO #####################
        self.kp = 3000
        self.ki = 1000
        self.limits = (0,120000) #120kW

        self.prevPower0 = 0.0
        self.power0 = 0.0
        self.tooFast0 = False
        self.PI0 = PID(self.kp, self.ki,0, cmdV)
        

        self.prevPower1 = 0.0
        self.power1 = 0.0
        self.tooFast1 = False
        self.PI1 = PID(self.kp, self.ki,0, cmdV)
        

        self.prevPower2 = 0.0
        self.power2 = 0.0
        self.tooFast2 = False
        self.PI2 = PID(self.kp, self.ki,0, cmdV)
        

        self.powers = {self.power0, self.power1, self.power2}
        
        
        
        
        
######################################### CLIENT INFO ###############################################################

        print(f"New {IDnum} created!")
        #server info
        self.broker = "broker.hivemq.com"
        self.port = 8000
        self.IDnum = IDnum
        self.msg = ""
        self.prevmsg = ""
        self.subscribed = False
        self.topicList = ["trains/PID","trains/nonvitals","trains/vitals","trains/updates"]
        
        #create client
        self.client = mqtt.Client(clean_session= True)
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        
        ################### TODO ###################
        #poll inputs and send TM in testenv
        #update displays
        #nonvitals use TCHW.py
        
#####################################################################################################################
#########################################   CLIENT AND PUBLISHING FUNCTIONS #########################################
#####################################################################################################################

        
######################################### CALLBACK FUNCTIONS #########################################
                    
    def on_connect(self, client, userdata, flags, rc):
        print(f"CONNECTED w/ CODE: {rc}")
        if (rc == 0):
            # subscribe to all needed topics, which need to put into on_connect
            self.client.subscribe("trains/brake")
            self.client.subscribe("trains/vitals")
            self.client.subscribe("trains/nonvitals")
            self.client.subscribe("trains/updates")
            self.subscribed = True
        else:
            self.subscribed = False


    
    
    def on_publish(self):
        if (result > 0):
            print("SEND SUCCESS")
        else:
            print("ERROR FAILED TO SEND w/ CODE {client.rc}")
       

    # the callback function, it will be triggered when receiving messages
    def on_message(self, client, userdata, msg):
        if (msg.payload != self.prevmsg):
            #TODO
            self.decodeguy(msg)
            
                 
        elif(self.prevmsg == msg.payload):
            print(f"ERROR! REPEATED MSG: in {msg.topic} ")
            print(f"{msg.payload}")
            print("PREV MSG: ")
            print(f"{self.prevmsg}")
            
        else:
            print("ERROR! INVALID ENTRY: ")
            print(f"{msg.topic}")
        
        self.prevmsg = msg.payload
        
        
        
######################################### CLIENT INTERFACE FUNCTIONS #########################################
        
        
    def send_msg(self, topic, msg):
        self.client.publish(topic, msg, 1)

        #print(f"{msg.topic} {msg.payload}")
        #print("payload is " + str(int(msg.payload)))
        
        #self.decode(msg)
            
                # update TC info
                # if GPIO
                # access GPIO
                
                
    def connectHandler(self):
        #if already connected keep it pushing
        if self.client.is_connected():
            return True
            
        #update user
        print("CONNECTING...")
        self.client.connect("broker.hivemq.com", 1883, 8000)
        self.client.loop_start()
        
        for i in range(5):
            if self.client.is_connected():
                return True
        time.sleep(1)
        return False

        
    
        
#####################################################################################################################
#########################################   GPIO FUNCTIONS #########################################
#####################################################################################################################
    # inputs
    # displays 
    def autoON(self):
        self.autoLED.on()
        
    def autoOFF(self):
       self.autoLED.off()
    
       
    def LdoorON(self):
        self.doorsL.on()
    
    def RdoorON(self):
        self.doorsR.on()
        
    def LdoorOFF(self):
        self.doorsL.off()
    
    def RdoorOFF(self):
        self.doorsR.off()
        
        
    def exLightsON(self):
        self.exLights.on()
    
    def inLightsON(self):
        self.inLights.on()
        
    def exLightsOFF(self):
        self.exLights.off()
    
    def inLightsOFF(self):
        self.inLights.off()
        
       

    def brakeON(self):
        self.brake.on()
            
    def brakeOFF(self):
        self.brake.off()
            
        
    def EbrakeON(self):
        self.Ebrake.on()
        
            
    def EbrakeOFF(self):
        self.Ebrake.off()
        
        
    def BrakeFail(self):
        self.brakeFailled.on()
        
        
    def SignalFail(self):
        self.signalFialled.on() 
        
                   
    def EngineFail(self):
        self.engineFailled.on()  
        
    def ResetFail(self):
        self.brakeFailled.off()
        self.engineFailled.off()
        self.signalFialled.off()
        
        
        
    
#####################################################################################################################
#########################################   TRAIN CONTROLLER FUNCTIONS ##############################################
#####################################################################################################################
        # DECODE
        # update gpio
        # update log -> UPDATES TM

        
                
    def decodeguy(self, msg):
        
        if (msg.topic == "trains/vitals"):
            # SET COMMAND VEL
            if (b"ScmdV" in msg.payload):
                strguy = str(msg.payload.decode('utf-8'))
                num = [int(s) for s in strguy.split() if s.isdigit()]
                self.cmdV = num[0]
                temp = f"COMMAND VELOCITY UPDATED TO {num}"
                print(temp)
                self.client.publish("trains/updates", temp)
                
             #GET CMD VEL   
            elif (b"GcmdV" in msg.payload):
                temp = f"COMMAND VELOCITY REQUESTED {self.cmdV}"
                print(temp)
                self.client.publish("trains/updates", temp)
                
                
                
             #GET POWER   
            elif (b"GPOW" in msg.payload):
                temp = f"POWER REQUESTED {self.power0}"
                print(temp)
                self.client.publish("trains/updates", temp)
                
            #SET CURRV
            elif (b"scv" in msg.payload):
                print("WHERE AM I?")
                strguy = str(msg.payload.decode('utf-8'))
                num = [int(s) for s in strguy.split() if s.isdigit()]
                newV= num[0]
                if (self.autoMode):
                    # leaving from a stop
                    if (self.atStation and not (self.cmdV == 0 or self.auth == 0)):
                        self.LdoorOFF()
                        self.RdoorOFF()
                        self.brakeOFF()
                        self.atStation = False
                        print("Brake: OFF")

                    
                    #  recovered from too fast
                    if (self.tooFast0 and not(self.auth == 0) and (newV < self.cmdV)):
                        self.brakeOFF()
                        self.tooFast0 = False
                        print("Brake: OFF")

                    # setting too fast
                    if (newV > (self.cmdV + self.allowedError)):
                        print("Brake: ON")
                        self.tooFast0 = True
                        self.PILoop(0,0)
                        self.brakeON()

                    # normal auto use case, use commanded V
                    elif (not(self.brake or self.EBrake)):
                        self.prevPower = self.power0
                        self.PILoop(self.cmdV, newV)

                    # fail
                    else:
                        self.PILoop(0,0)
                
                # in manual, use manual Commanded V
                else:
                    if (not (self.manCmdV == 0 or self.brake or self.EBrake)):
                        self.PILoop(self.manCmdV, self.currV)

                        power = self.checkPriorConditions(newV)
                        temp = f"CURRENT in manny mode VELOCITY UPDATED TO {power}"
                        print(temp)
                        self.client.publish("trains/updates", temp)
                        
                        

                
                    
            #SET CURR VEL
            elif (b"ScurrV" in msg.payload):
                strguy = str(msg.payload.decode('utf-8'))
                num = [int(s) for s in strguy.split() if s.isdigit()]
                self.currV = num[0]
                if(self.currV < self.cmdV):
                    temp = f"CURRENT VELOCITY UPDATED TO {num}"
                    print(temp)
                    self.client.publish("trains/updates", temp)
                    
                else:
                    temp = f"VELOCITY FAILED TO UPDATE BC OoR{num}"
                    print(temp)
                    self.client.publish("trains/updates", temp)
                
                
            #GET CURR VEL
            elif (b"GcurrV" in msg.payload):
                temp = f"CURRENT VELOCITY REQUESTED {self.currV}"
                print(temp)
                self.client.publish("trains/updates", temp)
                
                
            #SET AUTH
            elif (b"Sauth" in msg.payload):
                strguy = str(msg.payload.decode('utf-8'))
                num = [int(s) for s in strguy.split() if s.isdigit()]
                self.auth = num[0]
                if (self.auth < self.authLimit):
                    temp = f"AUTHORITY UPDATED TO {num}"
                    print(temp)
                    self.client.publish("trains/updates", temp)
                else:
                    temp = f"AUTHORITY FAILED TO UPDATE BC OoR{num}"
                    print(temp)
                    self.client.publish("trains/updates", temp)
                
                
            #GET AUTH
            elif (b"Gauth" in msg.payload):
                temp = f"AUTHORITY REQUESTED {self.auth}"
                print(temp)
                self.client.publish("trains/updates", temp)
                
                
                
            # INCREASE CMDV +1
            elif (b"icmdV" in msg.payload):
                prev = self.cmdV
                self.cmdV = self.cmdV + 1.0
                temp = f"COMMAND VELOCITY UPDATED TO {self.cmdV} FROM {prev}"
                print(temp)
                self.client.publish("trains/updates", temp)
                
                
            # DECREASE CMDV -1
            elif (b"dcmdV" in msg.payload):
                prev = self.cmdV
                self.cmdV = self.cmdV - 1.0
                temp = f"COMMAND VELOCITY UPDATED TO {self.cmdV} FROM {prev}"
                print(temp)
                self.client.publish("trains/updates", temp)
                
                
                
             #SET kp
            elif (b"skp" in msg.payload):
                strguy = str(msg.payload.decode('utf-8'))
                num = [int(s) for s in strguy.split() if s.isdigit()]
                self.kp = num[0]
                temp = f"KP UPDATED TO {num}"
                print(temp)
                self.client.publish("trains/updates", temp)
            
                
            #GET KP
            elif (b"gkp" in msg.payload):
                temp = f"KP REQUESTED {self.kp}"
                print(temp)
                self.client.publish("trains/updates", temp)
                
            
            # INCREASE KP +1
            elif (b"ikp" in msg.payload):
                prev = self.kp
                self.kp += 1.0
                temp = f"KP UPDATED TO {self.kp} FROM {prev}"
                print(temp)
                self.client.publish("trains/updates", temp)
                
                
            # DECREASE KP -1
            elif (b"dkp" in msg.payload):
                prev = self.kp
                self.kp -= 1.0
                temp = f"KP UPDATED TO {self.kp} FROM {prev}"
                print(temp)
                self.client.publish("trains/updates", temp)
                
                
            #SET KI
            elif (b"ski" in msg.payload):
                strguy = str(msg.payload.decode('utf-8'))
                num = [int(s) for s in strguy.split() if s.isdigit()]
                self.ki = num[0]
                temp = f"KI UPDATED TO {num}"
                print(temp)
                self.client.publish("trains/updates", temp)
            
                
            #GET KI
            elif (b"gki" in msg.payload):
                temp = f"KI REQUESTED {self.ki}"
                print(temp)
                self.client.publish("trains/updates", temp)
                
            
            # INCREASE KI +1
            elif (b"iki" in msg.payload):
                prev = self.ki
                self.ki += 1.0
                temp = f"KI UPDATED TO {self.ki} FROM {prev}"
                print(temp)
                self.client.publish("trains/updates", temp)
                
                
            # DECREASE KI -1
            elif (b"dki" in msg.payload):
                prev = self.ki
                self.ki -= 1.0
                temp = f"KI UPDATED TO {self.ki} FROM {prev}"
                print(temp)
                self.client.publish("trains/updates", temp)
                
                
                
                
            #EMERGENCY BRAKE
            # EBRAKE ON
            elif (b"eb1" in msg.payload):
                self.EbrakeON()
                temp = f"!! Emergency Brakes: ON"
                print(temp)
                self.client.publish("trains/updates", temp)
                
             # EBRAKE OFF
            elif(b"eb0" in msg.payload):
                self.EbrakeOFF()
                temp = f"!! Emergency Brakes: OFF"
                print(temp)
                self.client.publish("trains/updates", temp)
                
            #GET EBRAKE
            elif (b"geb" in msg.payload):
                temp = f"EBRAKE STATUS REQUESTED {self.Ebrake.value}"
                print(temp)
                self.client.publish("trains/updates", temp)
                
            #SERVICE BRAKE
            #BRAKE ON
            elif (b"sb1" in msg.payload):
                self.brakeON()
                temp = f"Service Brakes: ON"
                print(temp)
                self.client.publish("trains/updates", temp)
    
             # BRAKE OFF
            elif(b"sb0" in msg.payload):
                self.brakeOFF()
                temp = f"Service BrakesO: OFF"
                print(temp)
                self.client.publish("trains/updates", temp)
                
                
            #GET BRAKE
            elif (b"gsb" in msg.payload):
                temp = f"BRAKE STATUS REQUESTED {self.brake.value}"
                print(temp)
                self.client.publish("trains/updates", temp)
                
            # FAILURES
            # BRAKE FAIL
            elif (b"bf1" in msg.payload):
                self.BrakeFail()
                temp = f"Brake Failure!"
                print(temp)
                self.client.publish("trains/updates", temp)
            #ENGINE FAIL
            elif (b"ef1" in msg.payload):
                self.SignalFail()
                temp = f"Engine Failure!"
                print(temp)
                self.client.publish("trains/updates", temp)
            #SIGNAL FAIL
            elif (b"sf1" in msg.payload):
                self.EngineFail()
                temp = f"Signal Failure!"
                print(temp)
                self.client.publish("trains/updates", temp)
                
            #RESET FAILURES
            elif(b"ref" in msg.payload):
                self.ResetFail()
                temp = f"Failures Reset"
                print(temp)
                self.client.publish("trains/updates", temp)
                
            #GET AUTO
            elif (b"Gauto" in msg.payload):
                temp = f"MODE REQUESTED {self.autoMode}"
                print(temp)
                self.client.publish("trains/updates", temp)
                
            #AUTO ON
            elif(b"auto1" in msg.payload):
                self.autoON()
                self.autoMode = True
                temp = f"AUTO ON"
                print(temp)
                self.client.publish("trains/updates", temp)
                
            # AUTO OFF
            elif(b"auto0" in msg.payload):
                self.autoOFF()
                self.autoMode = False
                temp = f"AUTO OFF"
                print(temp)
                self.client.publish("trains/updates", temp)
                
            # STRAY COMMANDS
            else:
                temp = f"STRAY[VITALS]: {msg.payload}"
                print(temp)
                self.client.publish("trains/updates", temp)
            
            
            #   NONVITALS   #
        elif(msg.topic == "trains/nonvitals"):
            
                #DOORS RIGHT OPEN
                if(b"rd1" in msg.payload):
                    self.RdoorON()
                    temp = f"RIGHT DOORS OPEN"
                    print(temp)
                    self.client.publish("trains/updates", temp)
                
                #DOORS RIGHT CLOSE
                elif(b"rd0" in msg.payload):
                    self.RdoorOFF()
                    temp = f"RIGHT DOORS CLOSED"
                    print(temp)
                    self.client.publish("trains/updates", temp)
                    
                #DOORS LEFT OPEN
                elif(b"ld1" in msg.payload):
                    self.LdoorON()
                    temp = f"LEFT DOORS OPEN"
                    print(temp)
                    self.client.publish("trains/updates", temp)
                    
                #DOORS LEFT CLOSE
                elif(b"ld0" in msg.payload):
                    self.LdoorOFF()
                    temp = f"LEFT DOORS CLOSED"
                    print(temp)
                    self.client.publish("trains/updates", temp)
                    
                #ECXT LIGHTS ON
                elif(b"el1" in msg.payload):
                    self.exLightsON()
                    temp = f"EXT LIGHTS ON"
                    print(temp)
                    self.client.publish("trains/updates", temp)
                
                # EXT LIGHTS OFF
                elif(b"el0" in msg.payload):
                    self.exLightsOFF()
                    temp = f"EXT LIGHTS OFF"
                    print(temp)
                    self.client.publish("trains/updates", temp)
                    
                # IN LIGHTS ON
                elif(b"il1" in msg.payload):
                    self.inLightsON()
                    temp = f"INT LIGHTS ON"
                    print(temp)
                    self.client.publish("trains/updates", temp)
                    
                # IN LIGHTS OFF
                elif(b"il0" in msg.payload):
                    self.inLightsOFF()
                    temp = f"INT LIGHTS OFF"
                    print(temp)
                    self.client.publish("trains/updates", temp)
                    
                    
                #GET TEMP
                elif (b"Gtemp" in msg.payload):
                    temp = f"TEMPERATURE REQUESTED {self.temp}"
                    print(temp)
                    self.client.publish("trains/updates", temp)
                    
                
                # INCREASE TEMP +1
                elif (b"Dtemp" in msg.payload):
                    prev = self.temp
                    self.temp += 1.0
                    temp = f"COMMAND VELOCITY UPDATED TO {self.temp} FROM {prev}"
                    print(temp)
                    self.client.publish("trains/updates", temp)
                    
                    
                # DECREASE TEMP -1
                elif (b"Itemp" in msg.payload):
                    prev = self.temp
                    self.temp -= 1.0
                    temp = f"COMMAND VELOCITY UPDATED TO {self.temp} FROM {prev}"
                    print(temp)
                    self.client.publish("trains/updates", temp)
                                    
                                
                  #STRAY NONVITAL                         
                else:
                    temp = f"STRAY [NONVITALS]: {msg.payload}"
                    print(temp)
                    self.client.publish("trains/updates", temp)
                
        # else:
            # temp = f"stray command: {msg.payload}"
            # print(temp)
            # self.client.publish("trains/updates", temp)
            
            
    def checkPriorConditions(self, inguy):
        # when in auto 
        newV = inguy
        if (self.autoMode):
            # leaving from a stop
            if (self.atStation and not (self.cmdV == 0 or self.auth == 0)):
                self.LdoorOFF()
                self.RdoorOFF()
                self.brakeOFF()
                self.atStation = False
                print("Leaving stop, Brake: OFF")

            
            #  recovered from too fast
            if (self.tooFast0 and not(self.auth == 0) and (newV < self.cmdV)):
                self.brakeOFF()
                self.tooFast0 = False
                print("Speed Recovered, Brake: OFF")

            # setting too fast
            if (newV > (self.cmdV + self.allowedError)):
                print("Going too fast, Brake: ON")
                self.tooFast0 = True
                self.PILoop(0,0)
                self.brakeON()

            # normal auto use case, use commanded V
            elif (not(self.brake or self.EBrake)):
                self.prevPower = self.power
                self.power0 = self.PILoop(newV)


            # fail
            else:
                self.PILoop(0,0)
        
        # in manual, use manual Commanded V
        else:
            if (not (self.manCmdV == 0 or self.brake or self.EBrake)):
                self.PILoop(self.manCmdV, inguy)
                
        
        
    def PILoop(self, setguy, inguy):
        self.PI0.setpoint = self.cmdV
        self.power0 = self.PI0(inguy, dt = self.timeInt) #timetep set to 1

        self.PI1.setpoint = setguy
        self.power1 = self.PI1(inguy, dt = self.timeInt) 

        self.PI2.setpoint = setguy
        self.power2 = self.PI2(inguy, dt = self.timeInt)


         #error check with timeout
        counter = 0 
        while True:
            if (max(self.powers) - min(self.powers) > self.allowedError and counter < 3):

                print("Error: Invalid Power Calculation")
                print("Trying again")
                # send a null power command in hopes it stabilizes
                self.PILoop(cmdV, 0)
                self.checkPriorConditions()
                counter += 1
            # if couunter exceeds 3 tries it begins an error alert
            elif (counter > 3):
                pass
                #TODO begin error alert
            # if counter < 3 and range < allowedError continue
            else:
                return self.power0
            
    def run(self):
        time.sleep(self.timeInt)
        if self.connectHandler():
            while(True):
                
                self.client.loop_start()
       
                
            
            

class Engine():
    def __init__(
                 self,
                 TrainController,
                 cmdV = 0,
                 currV = 0,
                 auth = 0,
                 trainID = 0
                 ):

######################## Train Info #####################
        self.trainID = trainID
        self.TC = InOut(cmdV = 0.0,currV = 0,auth = 0,IDnum = "TCHW0",timeInt = .1)

######################## Vitals #####################
        
        
        
        
    def checkPriorConditions(self, inguy, setguy):
        pass
        # when in auto 
        
            ##update dispalays TODO 



    def PILoop(self, setguy, inguy):
        self.PI0.setpoint = setguy
        self.power0 = self.PI0(inguy, dt = 1) #timetep set to 1

        self.PI1.setpoint = setguy
        self.power1 = self.PI1(inguy, dt = 1) 

        self.PI2.setpoint = setguy
        self.power2 = self.PI2(inguy, dt = 1)


         #error check with timeout
        counter = 0 
        while True:
            if (max(self.powers) - min(self.powers) > self.allowedError and counter < 3):

                print("Error: Invalid Power Calculation")
                print("Trying again")
                # send a null power command in hopes it stabilizes
                self.PILoop(setguy, 0)
                self.checkPriorConditions()
                counter += 1
            # if couunter exceeds 3 tries it begins an error alert
            elif (counter > 3):
                pass
                #TODO begin error alert
            # if counter < 3 and range < allowedError continue
            else:
                break

        
    def getPower(self):
        return self.power0


            


        

msgHandler = InOut(IDnum= 'TCHW3',timeInt = .1)
while(True):
    msgHandler.run()


