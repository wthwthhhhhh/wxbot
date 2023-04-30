/*
 * @Desc: robot
 * @Author: lwp
 * @Date: 2020-04-29 19:03:52
 * @LastEditors: lwp
 * @LastEditTime: 2020-05-14 15:34:40
 */
const logger = require('../util/logger')
const { log, ScanStatus, WechatyBuilder }= require('wechaty')
// const { PuppetPadplus } = require('wechaty-puppet-padplus')
const { PuppetPadlocal } = require('wechaty-puppet-padlocal')
const { Robot } = require('../models/robot')
const {onLogin,onLogout} = require('./lib/Login')
const onFriendShip = require('./lib/FriendShip')
const onMessage = require('./lib/Message')
const { onRoomJoin, onRoomLeave } = require('./lib/Room')

class Bot {
  constructor(_id, debug = false) {
    this._id = _id
  }
  //启动
  async start() {
    const robot = await Robot.findOne({_id:this._id}, { token: 1, nickName: 1, id: 1 })
    if(!robot) throw {message:'机器人不存在'}
    //if(!robot.token) throw {message:'缺少协议token'}
 
    //const puppet = new PuppetPadlocal({
    //  token: robot.token
    //})

    const bot = WechatyBuilder.build({
      name: robot.nickName,
      //puppet,
    })

    const res = await new Promise((resolve, reject) => {
     
      bot.on('scan', (qrcode) => {
        resolve({qrcode})
        }).on('login', async (user)=>{
            const res = await onLogin(bot,this._id,user)
            resolve(res)
        })
        .on('message', onMessage)
        .on('friendship', onFriendShip)
        .on('room-join', onRoomJoin)
        .on('room-leave', onRoomLeave)
        .on('error', error => {
          logger.error('机器故障，error：' + error)
          reject(error)
        })
        .on('logout', onLogout)
        .start()
    });
    return res
  }
}
module.exports = Bot
