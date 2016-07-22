

var fs = require('fs');

var writeFile = (file_path, content) => {
  fs.writeFile(file_path, content, function(err) {
    if(err) {
        return console.log(err);
    }

    // console.log(`The file '${file_path}' was saved!`);
  });
}


var header = `
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">

<style>
.avatar {
  height: 300px;
}
</style>

`;

var avatars = fs.readdirSync("dcard").map( (x) => {

  return `
    <div class="col-sm-6 col-md-2">
      <div class="thumbnail">
        <img src="dcard/${x}/avatar.jpg" />
        <div class="caption">
          <p>${x}</p>
        </div>
      </div>
    </div>
  `

}).join("");


var content = `
${header}

<div class="row">
${avatars}
</div>
`;

writeFile("dcard_history.html", content);


