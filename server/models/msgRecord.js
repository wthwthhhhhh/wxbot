const { mongoose } = require('../config/db')
const Schema = mongoose.Schema
const schema = new Schema({
  id: String,
  personId: String,
  personName: String,
  avatar: String,
  groupId: String,
  groupName: String,
  msg: String,
  dateTime: Date,
  isAnalysis:Boolean
})
const MsgRecord = mongoose.model('msgRecord', schema, 'msgRecord')
module.exports = {
  MsgRecord,
  Dao:{
    getByPersonName: async (personName)=>{
      try { 
        const result = await MsgRecord.find({ personName: personName })
        return result
      } catch (err) { throw err }
    },
    update: async (id, params) => {
      try {
        const result = await MsgRecord.findByIdAndUpdate(id, params, {
          new: true
        }).exec();
        return result
      } catch (err) { throw err }
    },
    add: async (params) => {
      try {
        //let query = {
        //  id: params.id,
        //  personName: params.personName,
        //  avatar: params.avatar,
        //  groupId: params.groupId,
        //  groupName: params.groupName,
        //  msg: params.msg,
        //  dateTime: params.dateTime,
        //  isAnalysis: params.isAnalysis
        //}
        const result = await MsgRecord.create(params)
        return result
      } catch (err) { throw err }
    },
  }
}
