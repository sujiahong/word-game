"use strict";
const TAG = "Room.js";

class Room{
    constructor(type){
        this.type = type
        this.roomId = 0;
        this.playersInSeat = [];
        
        
        this.scene = null;
    }

    seatdown(){

    }

    leave(){
        
    }
}

module.exports = Room;