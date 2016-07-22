var DcardAPI = require('DcardAPI');
var fs = require('fs');
var request = require('request');
var mkdirp = require('mkdirp');


var downloadFile = (file_path, url) => {
  request
  .get(url)
  .on('error', function(err) {
    console.log(err)
  })
  .pipe(fs.createWriteStream(file_path))
}

var getDate = () => {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "-" + month + "-" + day;
}

var writeFile = (file_path, content) => {
  fs.writeFile(file_path, content, function(err) {
    if(err) {
        return console.log(err);
    }

    // console.log(`The file '${file_path}' was saved!`);
  });
}

var uniqueArray = (arr) => {
  return arr.filter(function(elem, pos) {
    return arr.indexOf(elem) === pos;
  })
}



var DCARD_FOLDER = 'dcard'
var FRIENDS_FOLDER = 'friends'


try {

process.chdir(__dirname)

var loginInfo = JSON.parse(fs.readFileSync('loginInfo.json'));

DcardAPI.login(loginInfo).then((x) => {
  
  DcardAPI.getDcard().then((res) => {
    // console.log(res)

    var dcard = res.dcard;
    var folder_name = `${getDate()} ${dcard.school}-${dcard.department} (${dcard.gender})`;
    var folder_path = `${DCARD_FOLDER}/${folder_name}`;

    mkdirp.sync(folder_path)

    writeFile(`${folder_path}/info.txt`, JSON.stringify(res, null, 2));
    downloadFile(`${folder_path}/avatar.jpg`, dcard.avatar);
  });
  

  DcardAPI.getAllFriendInfo().then((friends) => {
    
    var INTRO_FOLDER = 'intro';
    var AVATAR_FOLDER = 'avatar';

    console.log(friends.length)

    // var friend = friends[0];
    friends.forEach( (friend) => {
      // console.log(friend);

      var friend_path = `${FRIENDS_FOLDER}/${friend.name}`;
      var intro_folder_path = `${friend_path}/${INTRO_FOLDER}`;
      var avatar_folder_path = `${friend_path}/${AVATAR_FOLDER}`;
      mkdirp.sync(intro_folder_path);
      mkdirp.sync(avatar_folder_path);


      var needRecordInfo = false;
      var needRecordAvatar = false;
      var intro_files = fs.readdirSync(intro_folder_path).sort();
      if (intro_files.length > 0) {
        var newest_intro_file = intro_files[intro_files.length-1];
        var newest_intro = JSON.parse(fs.readFileSync(`${intro_folder_path}/${newest_intro_file}`))
        if (JSON.stringify(newest_intro) != JSON.stringify(friend)) {
          needRecordInfo = true;

          if (newest_intro.avatar != friend.avatar) {
            needRecordAvatar = true;
          }
        }
      } else {
        needRecordInfo = true;
        needRecordAvatar = true;
      }

      if (needRecordInfo) {
        console.log(JSON.stringify(friend, null, 2))
        writeFile(`${intro_folder_path}/${getDate()}.txt`, JSON.stringify(friend, null, 2))
      }
      
      if (needRecordAvatar) {
        console.log(friend.avatar)
        downloadFile(`${avatar_folder_path}/${getDate()}.jpg`, friend.avatar)
      }


      /** WARNING: cannot get all message (miss older msg) **/
      DcardAPI.getMessage(friend.id).then((msg) => {

        var msg_file = `${friend_path}/message.txt`;
        var msg_content = [];
        if (fs.existsSync(msg_file)) {
          msg_content = JSON.parse(fs.readFileSync(msg_file));
        }
        
        // console.log(msg)

        var new_msg_content = uniqueArray(
            msg_content.concat(msg).map( (x)=>{return JSON.stringify(x)} )
        ).map( (x)=>{return JSON.parse(x)})
         .sort( (a, b) => {return a.createdAt < b.createdAt});
        if ( JSON.stringify(new_msg_content) != JSON.stringify(msg_content) )
          writeFile(msg_file, JSON.stringify(new_msg_content, null, 2));


      });

    })

    
  })

})




} catch (err) {
  console.log (err);
}