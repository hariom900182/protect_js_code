const fs = require('fs');
var list_of_lines= [];
var strs=[];
var identifiers=[];
var offset=100;
function make_list_of_code_lines(data)
{
    var list_of_lines =data.split("\n");
    console.log(list_of_lines);
}
function remove_all_comments(data)
{
    const regex = /\/\/[ a-zA-Z0-9<>{}\[\]{}!@#$%^&*()-_+=\/\\]*/ig;
    //console.log(data.replaceAll(regex, ''));
    return data.replaceAll(regex, '');
}
function encode_strings(data)
{
   var encoded_string = "";
  //  for(var i=0;i<data.length;i++)
  //  {
    
  //     encoded_string=  encoded_string +  ""+;
  //  }
   return Buffer.from(data).toString('hex');
}
function encode_identifiers(data)
{
   var encoded_string = "";
   for(var i=0;i<data.length;i++)
   {
    
      encoded_string=  encoded_string + "0x"+ data[i].charCodeAt(0).toString(16);
   }
   return encoded_string;
}
try {
  var data = fs.readFileSync('sample.js', 'utf8');
  data  = remove_all_comments(data);
  var  vars =[...data.matchAll(/var [a-zA-Z0-9_]*/g)];
  var consts = [...data.matchAll(/const [a-zA-Z0-9_]*/g)];
  var functions = [...data.matchAll(/function [a-zA-Z0-9_]*/g)];
  var strings = [...data.matchAll(/"[a-zA-Z0-9 !@#$%^&*(){}\[\].:<>?';,]+"*/g)];

  //encode identifiers
  //vars
  for(var i=0;i<vars.length;i++)
  {
      var string_part = vars[i][0].split(" ");
      var val = offset.toString(16);
      offset++;
      identifiers[vars[i]] = "var _0x"+val;//string_part[0]+" " +encode_identifiers(string_part[string_part.length-1]);

  }
  //const
  for(var i=0;i<consts.length;i++)
  {
      var string_part = consts[i][0].split(" ");
      var val = offset.toString(16);
      offset++;
      identifiers[consts[i]] =  "const _0x"+val;//string_part[0]+" " +encode_identifiers(string_part[string_part.length-1]);
  }
   //functions
   for(var i=0;i<functions.length;i++)
   {
       var string_part = functions[i][0].split(" ");
       var val = offset.toString(16);
      offset++;
       identifiers[functions[i]] =  "function _0x"+val;//string_part[0]+" " +encode_identifiers(string_part[string_part.length-1]);
   }
  //end

  //encode strings literals
  for(var i=0;i<strings.length;i++)
  {
      strs[strings[i]] = encode_strings(strings[i][0]);
  }
  //end
  //replace string values
  for (var key in strs){
    var re = new RegExp(key, "g");
    data =data.replace(re,  "Buffer.from('"+strs[key]+"','hex').toString()");
  }
  
  //replace identifiers
  for (var key in identifiers){
    var re = new RegExp(key, "g");
    data =data.replace(re,identifiers[key]);
    var iname=key.split(" ");
    var ivalue = identifiers[key].split(" ");
    var regex = "^[ (={\[><\/(+]"+iname[iname.length-1]+"|"+iname[iname.length-1]+"[ )%*=<>\/%&;)+]";
    var re = new RegExp(regex, "g");
    //console.log(data.replaceAll(regex, ''));
   // data = data.replaceAll(re, ivalue[ivalue.length-1]);
   var match_obj = [...data.matchAll(re)];
   for(var i=0;i<match_obj.length;i++)
   {
        var i_key = match_obj[i][0];
        var r_str = i_key.replace(iname[iname.length-1],ivalue[ivalue.length-1]);
        data = data.replaceAll(i_key,r_str);
   }
    //console.log(match_obj);
  }

  
// data =data.replaceAll("\n","");
fs.writeFileSync('sample_encoded.js', data);
} catch (err) {
  console.error(err);
}