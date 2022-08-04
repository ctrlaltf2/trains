from gpiozero import LED          
#imports LED functions from gpiozero library
from gpiozero import Button        
#imports Button functions from gpiozero library

led = LED(4)
#declare the GPIO pin 4 for LED output and store it in led variable
button = Button(17)
#declare the GPIO pin 17 for Button output and store it in button variable

while True:
#initiated an infinite while loop
        button.wait_for_press()
#use the built-in function of the button to wait till press
        led.on()
#turn on the led
        button.wait_for_release()
#use the built-in function of button to wait till release
        led.off()
#turn off the led