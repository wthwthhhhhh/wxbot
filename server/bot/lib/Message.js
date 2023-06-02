/*
 * @Desc: 消息监听
 * @Author: lwp
 * @Date: 2020-04-26 15:27:24
 * @LastEditors: lwp
 * @LastEditTime: 2021-06-25 10:24:30
 */
const { Message } = require('wechaty')
const { Group } = require('../../models/group')
const { Robot } = require('../../models/robot')
const { Reply } = require('../../models/reply')
const { Memory } = require('../../models/memory')
const { MsgRecord } = require('../../models/msgRecord')
const { v1 } = require('node-uuid')
const crypto = require('crypto')
let md5 = crypto.createHash('md5')
const uniqueId = md5.update(v1()).digest('hex')
const TXHOST = 'http://api.tianapi.com/txapi/'
const { tianApiKey, crmUrl } = require('../../../config')
const urllib = require('urllib')
const PUPPET = require( "wechaty-puppet")
const axios = require('axios');

async function onMessage(msg) {
  try {
  if (msg.self()) return
  console.log("=============================")
  console.log(`msg : ${msg}`)
  console.log(
    `from: ${msg.talker() ? msg.talker().name() : null}: ${msg.talker() ? msg.talker().id : null
    }`
  )
  const robot = await Robot.findOne({ id: bot.id }, { id: 1, nickName: 1 })
  if (msg.type() === PUPPET.types.Message.Text) {
    if (msg.room()) { //来自群聊
      console.log("==============来自群聊===============")
      let room = await msg.room()
      const group = await Group.findOne({ id: room.id }, { control: 1 })
      if (!group || !group.control) return
      console.log("==============来自群聊1===============")
      const topic = await room.topic()
      await addMsgRecord(msg.id, msg.text(), msg.talker(), room.id, topic);

      var crmRes =  addCrmMsgRecord(msg.id, msg.text(), msg.talker(), room.id, topic, robot);

      console.log("==============来自群聊2===============")
      if (await msg.mentionSelf()) { //@自己
        let self = await msg.talker()
        self = '@' + self.name()
        let sendText = msg.text().replace(self, '')
        sendText = sendText.trim()
        // 获取需要回复的内容
        let content = await keyWordReply(sendText, room.id)
        crmRes.then(async result => {
          console.log(result)
            if (result && result.checking) {

              content = result.resultMsg;
            }
            if (!content) {
              content = await getReply(sendText)
            }
            room.say(content)
      })
        .catch (error => {
        console.log(error); // 处理错误
      });
        //if (crmRes && crmRes.checking()) {
        //  content = crmRes.resultMsg();
        //}
        //if (!content) {
        //  content = getReply(sendText)
        //}
        //room.say(content)
        return
      }
      //@成员
      let sendText = msg.text()
      let person = false
      if (sendText.indexOf('@') == 0) {
        const str = sendText.replace('@', '').split(' ')
        if (!str[1]) return
        person = str[0].trim()
        sendText = str[1].trim()
      }
      let content = await keyWordReply(sendText, room.id, person, room)
      if (content) {
        if (person) {
          content = `@${person} ${content}`
        } else {
          content = `「${msg.talker().name()}：${msg.text()}」\n- - - - - - - - - - - - - - -\n${content}`
        }
        room.say(content)
      }
      return
    }
    //私聊
    if (await isRoomName(msg)) return
    var crmUpdateRes =  updateCrmMsgRecord(msg.id, msg.text(), msg.talker(), "private chat", "私聊", robot);
    let content = await keyWordReply(msg.text())
    crmUpdateRes.then(async result => {
      console.log(result)
        if (result ) {
          content = result.resultMsg;
        }
        if (!content) {
          content = await getReply(msg.text())
        }
        await msg.say(content)
  })
    .catch (error => {
    console.log(error); // 处理错误
  });
   
    return
  }
}catch(e) {
  console.log(e); // 处理错误
}
}
/**
 * @description 收到消息是否群聊名称
 * @param {Object} bot 实例对象
 * @param {Object} msg 消息对象
 * @return {Bool} 
 */
async function isRoomName(msg) {
  const group = await Group.findOne({ joinCode: msg.text() }, { id: 1 })
  if (group) {
    //通过群聊id获取群聊实例
    const room = await bot.Room.find({ id: group.id })
    if (await room.has(msg.talker())) {
      await msg.say('您已经在群聊中了')
      return true
    }
    await room.add(msg.talker())
    await msg.say('已发送群邀请')
    return true
  }
  return false
}

/**
 * 消息记录
 * @param {string} id 消息ID
 * @param {string} msg 消息内容
 * @param {string} talker 消息发送者
 * @param {string} groupId 群聊ID
 * @param {string} groupName 群聊名称
 */
async function addMsgRecord(id, msg, talker, groupId, groupName) {
  try {
    console.log("msgRecord.add=>"+msg)
    await MsgRecord.create({
      id: id,
      personId: talker ? talker.id : null,
      personName: talker ? talker.name() : null,
      avatar: talker ? talker.avatar().name : null,
      groupId: groupId,
      groupName: groupName,
      msg: msg,
      dateTime: new Date(),
      isAnalysis: false
    });
    console.log("msgRecord.added=>" + msg)
    return true;
  } catch (err) {
    console.log("msgRecord.add error=>" + err);
    return false
  }
}

/**
 * Crm消息记录
 * @param {string} id 消息ID
 * @param {string} msg 消息内容
 * @param {string} talker 消息发送者
 * @param {string} groupId 群聊ID
 * @param {string} groupName 群聊名称
 */
async function addCrmMsgRecord(id, msg, talker, groupId, groupName, robot) {
  try {
    console.log("addCrmMsgRecord.add=>" + msg);
    await MsgRecord.create();
    const data = {
      id: id,
      personId: talker ? talker.id : null,
      personName: talker ? talker.name() : null,
      avatar: talker ? talker.avatar().name : null,
      groupId: groupId,
      groupName: groupName,
      msg: msg,
      dateTime: new Date(),
      isAnalysis: 0,
      botId: robot.id,
      botCode: robot.id,
      botName: robot.nickName,
      senderId: talker ? talker.id : null,
      senderName: talker ? talker.name() : null
    };

    const config = {
      method: 'post',
      url: crmUrl + '/wechatmsglog/save',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };

    return new Promise((resolve, reject) => {
      axios(config)
        .then(function (response) {
          console.log(JSON.stringify(response.data));
          if (response.data && response.data.success) {
            console.log(JSON.stringify(response.data.data));
            resolve(response.data.data); // 将请求结果作为主方法的返回值
          } else {
            reject(null);
          }
        })
        .catch(function (error) {
          console.log(error);
          reject(error);
        });
    });
  } catch (err) {
    console.log("addCrmMsgRecord.add error=>" + err);
    return Promise.reject(err);
  }
}
/**
 * Crm消息记录
 * @param {string} id 消息ID
 * @param {string} msg 消息内容
 * @param {string} talker 消息发送者
 * @param {string} groupId 群聊ID
 * @param {string} groupName 群聊名称
 */
async function updateCrmMsgRecord(id, msg, talker, groupId, groupName, robot) {
  try {
    console.log("updateCrmMsgRecord.add=>" + msg);
    await MsgRecord.create();
    const data = {
      id: id,
      personId: talker ? talker.id : null,
      personName: talker ? talker.name() : null,
      avatar: talker ? talker.avatar().name : null,
      groupId: groupId,
      groupName: groupName,
      msg: msg,
      dateTime: new Date(),
      isAnalysis: 0,
      botId: robot.id,
      botCode: robot.id,
      botName: robot.nickName,
      senderId: talker ? talker.id : null,
      senderName: talker ? talker.name() : null
    };

    const config = {
      method: 'post',
      url: crmUrl + '/wechatmsglog/update',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };

    return new Promise((resolve, reject) => {
      axios(config)
        .then(function (response) {
          console.log(JSON.stringify(response.data));
          if (response.data && response.data.success) {
            console.log(JSON.stringify(response.data.data));
            resolve(response.data.data); // 将请求结果作为主方法的返回值
          } else {
            reject(null);
          }
        })
        .catch(function (error) {
          console.log(error);
          reject(error);
        });
    });
  } catch (err) {
    console.log("updateCrmMsgRecord.add error=>" + err);
    return Promise.reject(err);
  }
}
/**
 * 自定义回复
 * @param {string} keyword 关键字
 * @param {string} roomId 群聊id
 * @param {string} person 艾特的群成员
 * @param {string} room 群聊
 */
async function keyWordReply(keyword, roomId, person, room) {
  try {
    const res = await Reply.findOne({ keyword: keyword, status: 1 }, { content: 1, type: 1, factor: 1, roomId: 1 })
    if (!res) return false
    if (roomId) { //群聊
      if (res.type == 0) {
        if (res.factor == 0 || res.factor == 3) return res.content
        if (res.factor == 2 && roomId == res.roomId) return res.content
      }
      if (res.type == 2) {
        if (person) {
          const group = await Group.findOne({ id: roomId }, { maxFoul: 1 })
          let foulCount = await Memory.countDocuments({ person: person, cmd: keyword, roomId: roomId })
          if (group.maxFoul - 1 == foulCount) {
            const contact = await bot.Contact.find({ name: person })
            await room.del(contact)
            await Memory.deleteMany({ person: person, roomId: roomId })
          } else {
            await Memory.create({ person: person, cmd: keyword, roomId: roomId })
            foulCount++
            return `您一定是违反了群的相关规则，如果再收到${group.maxFoul - foulCount}次同类消息，您将被移出本群。`
          }
        }
      }
      return false
    }
    //私聊
    if (res.type == 1) {
      const robot = await Robot.findOne({ id: bot.id }, { id: 1, nickName: 1 })
      const roomList = await Group.find({ robotId: robot.id, autojoin: true }, { topic: 1, id: 1, joinCode: 1 })
      let content = `${robot.nickName}管理群聊有${roomList.length}个：\n\n`
      roomList.forEach(item => {
        content += `${item.joinCode}：【${item.topic}】\n`
      })
      content += '\n回复字母即可加入对应的群哦，比如发送 ' + roomList[0].joinCode
      return content
    }
    if (res.factor == 0 || res.factor == 1) return res.content
    return false
  } catch (err) { return false }
}

/**
 * @description 机器人回复内容
 * @param {String} 收到消息
 * @return {String} 响应内容
 */
async function getReply(keyword) {
  let url = TXHOST + 'robot/';
  const pkg = {
    method: 'get',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      key: tianApiKey,
      question: keyword,
      mode: 1,
      datatype: 0,
      userid: uniqueId,
      limit: 1
    },
    encoding: null,
    timeout: 5000,
  }
  let { status, data } = await urllib.request(url, pkg)
  if (status !== 200) return '不好意思，我断网了'
  data = JSON.parse(data.toString())
  if (data.code != 200) return '我累啦，等我休息好再来哈'
  return data.newslist[0].reply
}
module.exports = onMessage
