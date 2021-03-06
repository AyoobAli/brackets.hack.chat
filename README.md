# Hack.Chat Integration

This is an extension to integration [hack.chat](https://hack.chat/) with [Brackets](http://brackets.io). 

Feel free to fork or use the code for any other extension.
![alt text](screenshot/screenshot.png "Main Channel + Private Channel")

### Installation

* Select **File > Extension Manager...** (or click the "brick" icon in the toolbar)
* Click **Install from URL...** or search for **Hack.Chat Integration**
* Enter the url of this repo: https://github.com/AyoobAli/brackets.hack.chat
* Click **Install**

### How to use

 * Go to "Navigate" => "Hack.Chat - Change Channel"
    * Or click Hack.Chat icon on the toolbar.
 * It will auto generate a random channel name, then will ask you if you want to change it.
    * You can leave the channel room empty to enter the main page and select one of the main channels.


#### TODO:

 - Option to switch the Chat panel between bottom and sidebar.
 - Option to change the main server (https://hack.chat/).
 
#### Update

 - _v0.0.5_ - 22/07/2015
    - Add: New menu item to rejoin the current channel.
    - Change: Changed the toolbar Icon.
    
 - _v0.0.4_ - 16/07/2015
    - Add: Confirmation message when changing channel.
    - Add: New menu Item to get the URL to the current channel.
    - Fix: Deosn't change channel when panel is hidden.
    
 - _v0.0.3_ - 15/07/2015
    - Add: Menu item to go to the main page of hack.chat
    - Add: Menu item to join ?programming channel.
    - Fix: Panel gives an error when loading for the first time.

 - _v0.0.2_ - 14/07/2015
    - By [ToastyStoemp](https://github.com/ToastyStoemp): When channel is entered with or without '?' it will connect to the same channel.
