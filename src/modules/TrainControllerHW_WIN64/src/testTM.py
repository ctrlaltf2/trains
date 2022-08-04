from asyncio import open_connection
from pydoc_data.topics import topics
import time
import paho.mqtt.client as mqtt
broker = "broker.hivemq.com"
port = 8000



class testInOut():
    def __init__(self):
        self.prevmsgIn = ""
        self.prevmsgOut = ""
        self.msgOut = ""
        self.prevTopic = ""
        self.topicOut = ""
        self.IDnum = "TCHW TESTER"

        self.client = mqtt.Client()
        self.client.on_publish = self.on_publish
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        

        print("CONNECTING...")
        self.client.connect("broker.hivemq.com", 1883, 8000)
        self.topicList = ["trains/PID","trains/nonvitals","trains/vitals", "trains/updates"]
        self.client.loop_start()
        self.testguy()


    def on_publish(self, client, userdata, result):             #create function for callback
        if (result >  0):
            print("SEND SUCCESS")
        else:
            print(f"FAILED TO SEND w/ CODE: {client.rc}")


    def on_connect(self, client, userdata, flags, rc):
        print("CONNECTED W/ CODE: ", {rc} )
        self.client.subscribe("trains/vitals")
        self.client.subscribe("trains/PISystem")
        self.client.subscribe("trains/nonvitals")
        self.client.subscribe("trains/updates")
        temp = f"{self.IDnum} joined!"
        self.client.publish("trains/updates", temp)


    # def publish_handler(self, topic = "trains/updates", txt = "empty update"):
    #     tempresult = self.client.publish(topic,txt)
    #     print("message sent status: ")
    #     print(tempresult)


    def on_message(self, client, userdata, msg):
        if ((msg.topic in self.topicList) and (msg.payload != self.prevmsgIn)):
            #TODO
            self.decodeguy(msg)
            
                
        elif(self.prevmsgIn == msg.payload):
            print("ERROR! REPEATED MSG: ")
            print(f"{msg.payload}")
            print("PREV MSG: ")
            print(f"{self.prevmsgIn}")
            
        else:
            print("ERROR! INVALID ENTRY: ")
            print(f"{msg.payload}")
        
        self.prevmsgIn = msg.payload
        
            
                # update TC info
                # if GPIO
                # access GPIO
                    

    def publishHandler(self, topic = "trains/updates",msg= "blank msg"):
        # temp = f"MSG: {msg} SENT TO {topic}"
        # self.client.publish(topic, msg)


        ################################  IMPORTANT ######################
        #ex) in JS
            # within given function
            #[using inc CMDV as example]
            #  
            # if (this->isAuto()):
                #this->publishHandler("trains/vitals", "icmdV")
            # else:
                #TrainCOntroller SW module


        pass

    def decodeguy(self,msg):
        pass

    def testguy(self):
        #self.client.loop_write()
        temp = "###############BEGIN TEST LOOP: POWER INPUTS FIRST ###############"
        print(temp)
        self.client.publish("trains/vitals", temp)


        print("testing PID, SPEED TOO HIGH")
        self.client.publish("trains/vitals", "scv 100")
        time.sleep(1)

        print("GET POWER 1")
        self.client.publish("trains/vitals", "GPOW")
        time.sleep(1)
        
        print("SET CMD VEL")
        self.client.publish("trains/vitals", "ScmdV 30")
        time.sleep(1)

        print("GET CURRV VEL 1")
        self.client.publish("trains/vitals", "GcurrV")
        time.sleep(1)

        print("GET POWER 1")
        self.client.publish("trains/vitals", "GPOW")
        time.sleep(1)

       

        print("testing PID 2")
        self.client.publish("trains/vitals", "scv 25")
        time.sleep(1)

        print("GET POWER 2")
        self.client.publish("trains/vitals", "GPOW")
        time.sleep(1)

        print("GET CMD VEL")
        self.client.publish("trains/vitals", "GcmdV")
        time.sleep(1)

        print("GET CURRV VEL 2")
        self.client.publish("trains/vitals", "GcurrV")
        time.sleep(1)

        print("SET CURRV VEL")
        self.client.publish("trains/vitals", "ScurrV 250")
        time.sleep(1)

        print("GET POWER 3")
        self.client.publish("trains/vitals", "GPOW")
        time.sleep(1)

        print("testing PID 3")
        self.client.publish("trains/vitals", "scv 25")
        time.sleep(1)

        print("GET CURRV VEL 3")
        self.client.publish("trains/vitals", "GcurrV")
        time.sleep(1)

        print("GET POWER 4")
        self.client.publish("trains/vitals", "GPOW")
        time.sleep(1)

        print("SET AUTH VEL")
        self.client.publish("trains/vitals", "Sauth 155")
        time.sleep(1)

        print("GET AUTH VEL")
        self.client.publish("trains/vitals", "Gauth")
        time.sleep(1)

        print("INC CMD VEL")
        self.client.publish("trains/vitals", "icmdV")
        time.sleep(1)

        print("DEC CMD VEL")
        self.client.publish("trains/vitals", "dcmdV")
        time.sleep(1)

        print("GET KP")
        self.client.publish("trains/vitals", "gkp")
        time.sleep(1)

        print("SET KP")
        self.client.publish("trains/vitals", "skp 8000")
        time.sleep(1)

        print("INCREASE KP")
        self.client.publish("trains/vitals", "ikp")
        time.sleep(1)

        print("DECREASE KP")
        self.client.publish("trains/vitals", "dkp")
        time.sleep(1)

        print("GET KI")
        self.client.publish("trains/vitals", "gki")
        time.sleep(1)

        print("SET KI")
        self.client.publish("trains/vitals", "ski 4200")
        time.sleep(1)

        print("INCREASE KI")
        self.client.publish("trains/vitals", "iki")
        time.sleep(1)

        print("DECREASE KI")
        self.client.publish("trains/vitals", "dki")
        time.sleep(1)


        temp = "############### VITALS NEXT ###############"
        time.sleep(2)
        print(temp)
        self.client.publish("trains/vitals", temp)


        # EBRAKE ON
        print("e. emergency brake ON")
        self.client.publish("trains/vitals", "eb1")
        time.sleep(1)

        #GET EBRAKE
        print("e. GET EBRAKE")
        self.client.publish("trains/vitals", "geb")
        time.sleep(1)

        #BRAKE ON
        print("f. service brake ON")
        self.client.publish("trains/vitals", "sb1")
        time.sleep(1)

        # GET BRAKE
        print("e. get brake")
        self.client.publish("trains/vitals", "gsb")
        time.sleep(1)


        #AUTO ON
        print("f.1. AUTO ON")
        self.client.publish("trains/vitals", "auto1")

        #SIGNAL FAIL
        print("g. testing signal fail")
        self.client.publish("trains/vitals", "sf1")
        time.sleep(1)
        
        #ENGINE FAIL
        print("h. testing engine failS")
        self.client.publish("trains/vitals", "ef1")
        time.sleep(1)

        #BRAKE FAIL
        print("i. testing brake fail")
        self.client.publish("trains/vitals", "bf1")

        #GET AUTO
        print("i.1. get AUTO")
        self.client.publish("trains/vitals", "Gauto")
        


        temp = "j.############### NONVITALS TURN ON ###############"
        time.sleep(2)
        print(temp)
        self.client.publish("trains/nonvitals", temp)
        self.client.publish("trains/updates", temp)
        #LEFT DOOR OPEN
        print("k. testing L door ON")
        self.client.publish("trains/nonvitals", "ld1")
        time.sleep(1)

        #RIGHT DOOR OPEN
        print("l. testing R door ON")
        self.client.publish("trains/nonvitals", "rd1")
        time.sleep(1)

        #EXT LIGHTS ON
        print("m. EXT LIGHT ON")
        self.client.publish("trains/nonvitals", "el1")
        time.sleep(1)

        #IN LIGHTS ON
        print("n. INT LIGHT ON")
        self.client.publish("trains/nonvitals", "il1")
        time.sleep(1)

        #GET TEMP
        print("n. GET TEMP")
        self.client.publish("trains/nonvitals", "Gtemp")
        time.sleep(1)

        #INCREASE TEMP
        print("n. INC TEMP")
        self.client.publish("trains/nonvitals", "Itemp")
        time.sleep(1)

        #DECREASAE TEMP
        print("n. DEC TEMP")
        self.client.publish("trains/nonvitals", "Dtemp")
        time.sleep(1)
        

        temp = "p. ############### TURNING OFF: VITALS ###############"
        print(temp)
        self.client.publish("trains/updates", temp)
        time.sleep(2)

        #EBRAKE OFF
        print("q. emergency brake OFF")
        self.client.publish("trains/vitals", "eb0")
        time.sleep(1)

        #BRAKE OFF
        print("r. service brake OFF")
        self.client.publish("trains/vitals", "sb0")
        time.sleep(1)

        #RESET FAILS
        print("s. testing reset fails")
        self.client.publish("trains/vitals", "ref")
        time.sleep(1)

        #LEFT DOOR CLOSE
        print("t. testing L door OFF")
        self.client.publish("trains/nonvitals", "ld0")
        time.sleep(1)

        #RIGHT DOOR CLOSE
        print("u. testing R door OFF")
        self.client.publish("trains/nonvitals", "rd0")
        time.sleep(1)

        #EXT LIGHT OFF
        print("v. EXT LIGHT OFF")
        self.client.publish("trains/nonvitals", "el0")
        time.sleep(1)

        #INT lIGHT OFF
        print("w. INT LIGHT OFF")
        self.client.publish("trains/nonvitals", "il0")
        time.sleep(1)

        #TURN AUTO OFF
        print("x. AUTO OFF")
        self.client.publish("trains/vitals", "auto0")
        time.sleep(1)


tester = testInOut()

