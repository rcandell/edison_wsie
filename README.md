# Edison Board for WSIE Project
Edison board setups for industrial wireless research

# This is a still being developed, DO NOT USE YET!

Rick Candell
Notes on setting up an Edison board for our project.

Intel Edison User Guides:
https://software.intel.com/en-us/intel-edison-board-user-guide

Step-by-step setup:
https://learn.sparkfun.com/tutorials/sparkfun-inventors-kit-for-edison-experiment-guide/all

# how to write a TCP server and client in Node.js
https://www.hacksparrow.com/tcp-socket-programming-in-node-js.html


Note that the tutorials don't really show how to configure a full network but only how to bring up a single board 

using wifi or usb.


Make sure that the firewall on the PC is not blocking BonjourPS.  I already did this on Ender.

***


password: cookiemonster
node name: edison01   (This will be different for each edison board)


Make sure that the firmware is upgraded to the latest!!!
I had to use the manual firmware loader.


Use the connman client to setup a persistent wifi connection
See wifi manual

Now setup the board to have a static IP address on the network of choice, e.g. 10.20.x.y



MORE INFO:

http://rwx.io/blog/2015/08/16/edison-wifi-config/


INTEL DEV ZONE
rcandell
monkey pound hero number one



## disable power control
iwconfig wlan0 power off
systemctl start wifi-power-management-off 
iwconfig wlan0



## powering down the edison
press and hold the pwr button for longer than 10 seconds



## CONFIGURING WIFI (FOLLOW DIRECTIONS for WPA SUPPLICANT)
# if not already down
configure_edison --setup
# modify the wpa_client_actions.sh file in /etc/wpa... such that the netmask is 255.0.0.0
# this part is very important
wpa_cli save
## DONE


# NOW MAKE SURE NETWORK SETUP CORRECTLY
wpa_cli –i wlan0 scan
wpa_cli –i wlan0 scan_results
wpa_cli -i wlan0 remove_network all
wpa_cli save
configure_edison --wifi
wpa_cli save

## From the XDK
# UPDATE XDK Daemon
# UPDATE LIBRARIES



if [ $# != 2 ] ; then
 echo "$0 <SSID> <passphrase>"
 exit
fi
wpa_cli -iwlan0 disconnect
wpa_cli -iwlan0 remove_network all
wpa_cli -iwlan0 add_network
wpa_cli -iwlan0 set_network 0 mode 0
wpa_cli -iwlan0 set_network 0 ssid \"$1\"
wpa_cli -iwlan0 set_network 0 auth_alg OPEN
wpa_cli -iwlan0 set_network 0 key_mgmt WPA-PSK
wpa_cli -iwlan0 set_network 0 proto RSN
wpa_cli -iwlan0 set_network 0 psk \"$2\"
wpa_cli -iwlan0 set_network 0 scan_ssid 1
wpa_cli -iwlan0 select_network 0
wpa_cli -iwlan0 enable_network 0
wpa_cli -iwlan0 reassociate
wpa_cli -iwlan0 status
wpa_cli save



