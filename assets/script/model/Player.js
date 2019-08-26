"use strict";
const TAG = "Player.js";

class Player{
    constructor(data){
        this.userId = data.id;
        this.nickname = "";
        this.sex = 0;
        this.icon = "";
        this.ip = "";
        this.coins = 0;
    }
}

module.exports = Player;