/**
 * Created by wy on 16/8/18.
 */
//引入数据库操作模块
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// 用户
/*var usersSchema = new Schema({
    username : String,
    password:String,
    createTime : { type: Date, default: Date.now }
},{collection: 'users'});*/

// 类别
/*var categorySchema = new Schema({
    name : String,
    columnName:String,
    parent:String,
    img:String,
    orderby:String,
    status:String,
    show_index:String,
    person:String,
    createTime : { type: Date, default: Date.now }
},{collection: 'category'});*/

/*exports.users = mongoose.model('users',usersSchema);
exports.category = mongoose.model('category',categorySchema);*/

// 使用此方法统一返回新对象
function InitWithCollection(json,name) {
    return new Schema(json,{collection:name})
}
// 用户
exports.users = mongoose.model('users',InitWithCollection({
    username : String,
    password:String,
    createTime : { type: Date, default: Date.now }
},'users'));

// 类别
exports.category = mongoose.model('category',InitWithCollection({
    name : String,
    columnName:String,
    parent:String,
    img:String,
    orderby:String,
    status:String,
    show_index:String,
    person:String,
    createTime : { type: Date, default: Date.now }
},'category'));

// 文章
exports.article = mongoose.model('article',InitWithCollection({
    img:String,
    title : String,
    content:String,
    categoryId:String,
    des:String,
    keywords:String,
    person:String,
    issue:String,
    createTime : { type: Date, default: Date.now }
},'article'));

// 上传
exports.upload = mongoose.model('upload',InitWithCollection({
    title:String,
    url:String,
    urlUse:String,
    person:String,
    createTime : { type: Date, default: Date.now }
},'upload'));

