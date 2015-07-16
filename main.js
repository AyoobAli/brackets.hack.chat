/*
   ,---,                                                          ,---,        ,--,
  '  .' \                                      ,---,             '  .' \     ,--.'|     ,--,
 /  ;    '.                 ,---.     ,---.  ,---.'|            /  ;    '.   |  | :   ,--.'|
:  :       \               '   ,'\   '   ,'\ |   | :           :  :       \  :  : '   |  |,
:  |   /\   \        .--, /   /   | /   /   |:   : :           :  |   /\   \ |  ' |   `--'_
|  :  ' ;.   :     /_ ./|.   ; ,. :.   ; ,. ::     |,-.        |  :  ' ;.   :'  | |   ,' ,'|
|  |  ;/  \   \ , ' , ' :'   | |: :'   | |: :|   : '  |        |  |  ;/  \   \  | :   '  | |
'  :  | \  \ ,'/___/ \: |'   | .; :'   | .; :|   |  / :        '  :  | \  \ ,'  : |__ |  | :
|  |  '  '--'   .  \  ' ||   :    ||   :    |'   : |: |        |  |  '  '--' |  | '.'|'  : |__
|  :  :          \  ;   : \   \  /  \   \  / |   | '/ :        |  :  :       ;  :    ;|  | '.'|
|  | ,'           \  \  ;  `----'    `----'  |   :    |        |  | ,'       |  ,   / ;  :    ;
`--''              :  \  \   AyoobAli.com    /    \  /         `--''          ---`-'  |  ,   /
                    \  ' ;                   `-'----'                                  ---`-'
                     `--`

The MIT License (MIT)

Copyright (c) 2015 Ayoob Ali

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */


/*jslint vars: true, plusplus: true, devel: true, nomen: true,  regexp: true, indent: 4, maxerr: 50 */
/*global define, brackets, $, window */
define(function (require, exports, module) {
    "use strict";


    var CommandManager      = brackets.getModule("command/CommandManager");
    var EditorManager       = brackets.getModule("editor/EditorManager");
    var ExtensionUtils      = brackets.getModule("utils/ExtensionUtils");
    var KeyBindingManager   = brackets.getModule("command/KeyBindingManager");
    var Menus               = brackets.getModule("command/Menus");
    var NativeApp           = brackets.getModule("utils/NativeApp");
    var PanelManager        = brackets.getModule("view/PanelManager");

    var templatePath        = require("text!template.html");
    var menuTitle           = ["Hack.Chat", "Channel: ?programming", "Hack.Chat - Change Channel", "Current Channel"];
    var extID               = ["brackets.hack.chat.mnu1", "brackets.hack.chat.mnu2", "brackets.hack.chat.mnu3", "brackets.hack.chat.mnu4"];

    var $toolbarIcon;
    var $iframe;

    var chName              = null;
    var chatBox;
    var isOn                = false;
    var isOnStt             = false;

    /**
     *
     * Generate random channel name then prompt user if he want to change it.
     *
     */
    function _generateChannelName() {
        var channelName = "";
        var i = 1;
        for (i = 1; i < 24; i++) {
            if ((i % 2) && (i > 5)) {
                channelName += String.fromCharCode(Math.floor(Math.random() * (57 - 48 + 1) + 48));
            } else {
                channelName += String.fromCharCode(Math.floor(Math.random() * (122 - 97 + 1) + 97));
            }
        }
        channelName = prompt("Channel Name: ", channelName);
        if (channelName !== null) {
            chName = channelName;
            $("#hackChatIcon").attr({ title: "Hack.Chat: " + chName });
            return true;
        } else {
            return false;
        }
    }

    /**
     *
     * Set the URL for the iframe (Joining the Channel).
     *
     */
    function _setIframeURL() {
        var chatURL = "https://hack.chat/";
        var channelNameP;
        if (chName !== null) {
            if (chName[0] === "?") {
                chatURL += chName;
            } else {
                chatURL += "?" + chName;
            }
        } else {
            if (_generateChannelName()) {
                chatURL += "?" + chName;
            }
        }
        $iframe.attr("src", chatURL);
        $iframe.load(function () {
            $iframe.contents().get(0).addEventListener("keydown", function (e) {
                // set focus to the Editor when pressing Esc
                if (e.keyCode === 27) {
                    EditorManager.focusEditor();
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            }, true);
        });
    }

    /**
     *
     * Resize the iframe to fit new window size.
     *
     */
    function _resizeIframe() {
        if (isOn && $iframe) {
            var chatBoxWidth = chatBox.$panel.innerWidth() + "px";
            $iframe.attr("width", chatBoxWidth);
        }
    }

    /**
     *
     * turn chat box on/off.
     *
     */
    function _switchChatBox(onOff) {
        if (onOff === isOnStt) {
            return;
        }
        isOnStt = onOff;
        if (onOff) {
            if (!chatBox) {
                var $panel = $(templatePath);
                $iframe = $panel.find("#hackChatIframe");
                chatBox = PanelManager.createBottomPanel("hack-chat-panel", $panel);
                $panel.on("panelResizeUpdate", function (e, newSize) {
                    $iframe.attr("height", newSize);
                });
                $iframe.attr("height", $panel.height());
                _setIframeURL();
                window.setTimeout(_resizeIframe);
            }
            $toolbarIcon.toggleClass("on");
            chatBox.show();
        } else {
            $toolbarIcon.toggleClass("on");
            chatBox.hide();
        }
    }

    /**
     *
     * Reload iframe URL
     *
     */
    function _iframeReloader() {
        $iframe.attr("src", "");
        window.setTimeout(_setIframeURL, 0);
    }

    /**
     *
     * Open/Close Chat Box from the toolbar
     *
     */
    function _toolbarChatClick() {
        if (chName !== null) {
            isOn = !isOn;
            _switchChatBox(isOn);
        } else {
            if (_generateChannelName()) {
                if (!isOn) {
                    isOn = !isOn;
                    _switchChatBox(isOn);
                } else {
                    _iframeReloader();
                }
            }
        }
    }

    /**
     *
     * loading Style.css.
     *
     */
    ExtensionUtils.loadStyleSheet(module, "style.css");

    /**
     *
     * Creating toolbar Icon.
     *
     */
    $toolbarIcon = $("<a>").attr({ id: "hackChatIcon", href: "#", title: "Hack.Chat" }).click(_toolbarChatClick).appendTo($("#main-toolbar .buttons"));

    /**
     *
     * call iframe resize function if workspace size changed
     *
     */
    $(PanelManager).on("editorAreaResize", _resizeIframe);
    $("#sidebar").on("panelCollapsed panelExpanded panelResizeUpdate", _resizeIframe);

    /**
     *
     * Changing channel name when Menu item is clicked
     *
     */
    function _changeChannel() {
        if (_generateChannelName()) {
            if (!isOn) {
                isOn = true;
                _switchChatBox(isOn);
                _iframeReloader();
            } else {
                _iframeReloader();
            }
        }
    }

    /**
     *
     * join a channel
     *
     */
    function _joinMain(channelName) {
        chName = channelName;
        $("#hackChatIcon").attr({ title: "Hack.Chat: " + channelName });
        if (!isOn) {
            isOn = true;
            _switchChatBox(isOn);
            _iframeReloader();
        } else {
            _iframeReloader();
        }
    }

    /**
     *
     * Join Channel Menu Items
     *
     */
    function _menuJoinMain() {
        if ( chName !== null && chName !== "" ) {
            if (!confirm("Are you sure you want to leave channel: " + chName)) {
                return false;
            }
        }
        _joinMain("");
    }

    function _menuJoinProgramming() {
        if ( chName !== null && chName !== "" ) {
            if (!confirm("Are you sure you want to leave channel: " + chName)) {
                return false;
            }
        }
        _joinMain("programming");
    }

    function _menuChannelName() {
        if ( chName === null || chName === "" ) {
            alert("You are not in any channel.");
            return false;
        }
        var chatURL = "https://hack.chat/";
        if (chName[0] === "?") {
            chatURL += chName;
        } else {
            chatURL += "?" + chName;
        }
        prompt("You are in: ", chatURL);
    }

    /**
     *
     * Creating menu item.
     *
     */
    CommandManager.register(menuTitle[0], extID[0], _menuJoinMain);
    CommandManager.register(menuTitle[1], extID[1], _menuJoinProgramming);
    CommandManager.register(menuTitle[2], extID[2], _changeChannel);
    CommandManager.register(menuTitle[3], extID[3], _menuChannelName);
    var menu = Menus.getMenu(Menus.AppMenuBar.NAVIGATE_MENU);
    menu.addMenuDivider();
    menu.addMenuItem(extID[0]);
    menu.addMenuItem(extID[1]);
    menu.addMenuItem(extID[2]);
    menu.addMenuItem(extID[3]);

});
