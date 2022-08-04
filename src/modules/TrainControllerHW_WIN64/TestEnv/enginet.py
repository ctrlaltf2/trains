from subprocess import check_output
from simple_pid import PID
import TrainController

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
        self.TC = TrainController

######################## Vitals #####################
        self.AnteayerV = 0.0 # T-2
        self.prevV = 0.0     # T-1
        self.currV = currV   # T  
        self.manCmdV = 0     
        self.cmdV = cmdV
        self.auth = auth
        self.brake = False
        self.EBrake = False
        self.allowedError = 5

######################## Power Info #####################
        self.kp = 3000
        self.ki = 1000
        self.limits = (0,120000) #120kW

        self.prevPower0 = 0.0
        self.Power0 = 0.0
        self.PI0 = PID(self.kp, self.ki, 0)
        self.tooFast0 = False

        self.prevPower1 = 0.0
        self.Power1 = 0.0
        self.PI1 = PID(self.kp, self.ki, 0)
        self.tooFast1 = False

        self.prevPower2 = 0.0
        self.Power2 = 0.0
        self.PI2 = PID(self.kp, self.ki, 0)
        self.tooFast2 = False

        self.powers = {self.power0, self.power1, self.power2}

    def checkPriorConditions(self):

        # when in auto 
        if (self.TC.auto):
            # leaving from a stop
            if (self.TC.atStation and not (self.cmdV == 0 or self.auth == 0)):
                self.TC.togDoorsL(False)
                self.TC.togDoorsR(False)
                self.turnBrakeOff()
                self.TC.atStation = False
                print("Brake: OFF")

            
            #  recovered from too fast
            if (self.tooFast0 and not(self.auth == 0) and (self.currV < self.cmdV)):
                self.turnBrakeOff()
                self.tooFast0 = False
                print("Brake: OFF")

            # setting too fast
            if (self.currV > (self.cmdV + self.AllowedError)):
                print("Brake: ON")
                self.tooFast0 = True
                self.PILoop(0,0)
                self.turnBakeOn()

            # normal auto use case, use commanded V
            elif (not(self.brake or self.EBrake)):
                self.prevPower = self.power
                self.PILoop(self.cmdV, self.currV)

            # fail
            else:
                self.PILoop(0,0)
        
        # in manual, use manual Commanded V
        else:
            if (not (self.manCmdV == 0 or self.brake or self.EBrake)):
                self.PILoop(self.manCmdV, self.currV)

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


                            ## TODO
                            # merge these 2

                            # finish parsing pubsub
                            # make simple comm test for pub subs
                            
                            # add gpio command
                            # test and get working PID reliably
                            # make most gpio set up
                            # set up full test class

   ###################### ON CLICK/CALL ACTIONS ACTIONS ######################
    def turnBrakeON(self):
        self.brake = True
        self.TrainController.SendServiceBrakeOn()
        self.BrakeFailureTest()
        self.TrainController.DisplayUpdate()

    def OnSBrakeOff(self):
        self.service_brake = False
        self.TrainController.SendServiceBrakeOff()
        self.TrainController.DisplayUpdate()
        
    def OnEBrakeOn(self):
        self.emergency_brake = True
        self.TrainController.SendEmergencyBrakeOn()
        self.TrainController.DisplayUpdate()

    def IncreaseSetpoint(self):
        if(self.setpoint_speed+1 <= self.commanded_speed):
            self.setpoint_speed = self.setpoint_speed + 1
        self.TrainController.DisplayUpdate()

    def DecreaseSetpoint(self):
        if(self.setpoint_speed > 0):
            self.setpoint_speed = self.setpoint_speed - 1
        self.TrainController.DisplayUpdate()

    ###################### FAILURE DETECTION ######################
    def DetectEngineFailure(self, current):
        if(current == 666):
            self.engine_failure = True
            self.TrainController.UI.ui.textBrowser_13.setStyleSheet(u"background-color: rgb(255, 0, 0);")
            self.VitalFault()
            self.TrainController.TrainModel.train_detected_engine_failure()

    def DetectBrakeFailure(self):
        if(self.service_brake and (self.current_speed >= (self.previous_speed+.5)) and not(self.current_speed == 0)):
            self.brake_failure = True
            self.TrainController.UI.ui.textBrowser_14.setStyleSheet(u"background-color: rgb(255, 0, 0);")
            self.VitalFault()
            self.TrainController.TrainModel.train_detected_brake_failure()

            print("Service brake: " + str(self.service_brake))
            print("Current Speed: " + str(self.current_speed))
            print("Previous speed: " + str(self.previous_speed))


    #testing brake failure
    def BrakeFailureTest(self):
        if(self.TrainController.TrainModel.train.brakeFailure):
            self.brake_failure = True
            self.TrainController.UI.ui.textBrowser_14.setStyleSheet(u"background-color: rgb(255, 0, 0);")
            self.VitalFault()
            self.TrainController.TrainModel.train_detected_brake_failure()
           # print("Service brake: " + str(self.service_brake))
           # print("Current Speed: " + str(self.current_speed))
           # print("Previous speed: " + str(self.previous_speed))
    
    def VitalFault(self):
        self.TC.any_failure = True
        print("##*!!!!!!*## VITAL FAULT DETECTED ##*!!!!!!*##")
        if(not(self.TrainController.passenger_brake_detected)):
            self.OnEBrakeOn()


