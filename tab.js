// Global variables
var snoo;
var usersOnPage = [];
var batchCounter = 0;

var options;

function onOptionsLoaded(data){
  options = data;
  let refresh_token = options.refresh_token;
  if (refresh_token == ""){
    startOAuthFlow();
  } else {
    getSnooWrap(refresh_token);
  }
}

function getSnooWrap(refresh_token){
  if (!snoo){
      snoo = new snoowrap({
                    userAgent: USERAGENT,
                    clientId: CLIENTID,
                    refreshToken: refresh_token,
                    clientSecret: "nonce"
                  });
  }
  console.log("Snoowrap instance created: " + snoo);
  beginFiltering();
}

function beginFiltering(){
  if (!snoo){
    console.log("Snoowrap object not found. Exiting");
    return;
  }

  console.log("Beginning filter operations: " + snoo);
  var fullnameBatches = getUserFullnameBatches();
  var numBatches = batchCounter = fullnameBatches.length;
  console.log("Username batches: " + fullnameBatches.length);

  for (var i = 0; i < fullnameBatches.length; i++){
    requestUsersInfo(fullnameBatches[i]);
  }
}

function requestUsersInfo(fullnames){
  let idString = fullnames.join();
  console.log("Id string: " + idString);
  snoo.oauthRequest({uri: '/api/user_data_by_account_ids', 
                    method: 'get', 
                    qs: {ids:idString}})
                .then(receiveUsersInfo, console.log);
}

function receiveUsersInfo(data){
  for (var key in data){
    if (data.hasOwnProperty(key)){
      usersOnPage[key] = data[key];
    }
  }
  batchCounter--;
  if (batchCounter <= 0)
    onAllUserRequestsComplete();
}

function onAllUserRequestsComplete(){
  console.log("Total unique users on page: " + usersOnPage.keys().length);
  
  var userObj;
  var ageString;
  var authorSelector;
  let hideByAge = options["hideByAge"];
  let ageLimit = options["ageLimit"];
  let displayAge = options["displayAge"];
  let currentUTC = Math.floor(Date.now() / 1000); //convert to seconds
  let maxCreatedUTC = currentUTC - ageLimit;


  for (key in usersOnPage){
    userObj = usersOnPage[key];



    if (options.hideItems && userObj["created_utc"] > maxCreatedUTC){
      if(!options.hideItemReplies){
        $("div[data-author-fullname='" + key + "'] > div.entry").hide();
        $("div[data-author-fullname='" + key + "'] > div.likes").hide();
      }else{
        $("div[data-author-fullname='" + key + "'].thing").hide();
      }

      
      console.log("Filtered out author: " + userObj.name);
    }

    if (options.displayAge){
      
      let $elem = getAgeElement(userObj, ageLimit);
      authorSelector = ".author.id-" + key;
      $( authorSelector ).after($elem);
    }
  }

}

function getAgeElement(userObj, ageLimit){
  var timecode = userObj.created_utc * 1000;
  var createDate = new Date(timecode);
  var difdt = new Date(new Date() - createDate);
  var ageSeconds = Math.floor(difdt.getTime() / 1000);

  var years = difdt.toISOString().slice(0, 4) - 1970;
  var months = difdt.getMonth();
  var days = difdt.getDate();

  var ageString = (years ? (years + "Y ") : "")  
              + (months ? (months + "M ") : "") 
              + (days ? (days + "D ") : ""); 
  ageString = ageString ? ageString : "< 1 day";

  //console.log(userObj.name + ": " + ageString);
  var color = "#fff";

  if (options.displayAgeColors){
     if (ageSeconds < ageLimit){
      let amount = Math.floor(ageSeconds / ageLimit * 255);
      color = "rgb(255," + amount + "," + amount +")";
    }else{
      let amount = 255 - Math.min(255, Math.floor((ageSeconds / (ageLimit * 10)) * 255));
      color = "rgb(" + amount + ",255," + amount + ")";
    }
  }
 

  var $elem = $("<span></span>").text(ageString).css({
                    "color": "#000",
                    "background-color": color, 
                    "padding": "3px",
                    //"border": "1px solid #000",
                  });
  return $elem;
}

function getUserFullnameBatches(){
  //returns an array of unique user fullnames
  var userFullnames = new Set();
  var fullnameBatches = [];

  $('div').filter(function(){
    if($(this).data('author-fullname') !== undefined)
      userFullnames.add($(this).data('author-fullname'));
      //console.log("Added fullname to set: " + $(this).data('author-fullname'));
  })

  userFullnames = [...userFullnames];
  console.log("Found " + userFullnames.length + " usernames");

  while (userFullnames.length > 0)
    fullnameBatches.push(userFullnames.splice(0, 100));
  return fullnameBatches;
}


(function(){
  let url = new URL(document.location.href);
  console.log("Current URL: " +  url);
  let code = url.searchParams.get("code");

  if (!code){
    loadOptions(onOptionsLoaded);
  } else {
    console.log("Code in URL: " +  code);
    getRefreshToken(code);
  }
})();
