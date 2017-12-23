var $years, $months, $days, $hideItems, $hideItemReplies, $displayAge, $displayAgeColors;

var options;

function onLoadOptionsPopup(data){
  console.log("Options loaded.");
  console.log(data);

  options = data;

  $years = $('#years').val(options.years);
  $months = $('#months').val(options.months);
  $days = $('#days').val(options.days);
  
  $hideItems = $('#hideItems').prop("checked", options.hideItems);
  $hideItemReplies = $('#hideItemReplies').prop("checked", options.hideItemReplies);

  $displayAge = $('#displayAge').prop("checked", options.displayAge);
  $displayAgeColors = $('#displayAgeColors').prop("checked", options.displayAgeColors);

  $hideItemReplies.prop("disabled", !options.hideItems);
  $displayAgeColors.prop("disabled", !options.displayAge);

  $("input[type=checkbox]").on("change", function (){
    var optionName = $(this).attr("id");
    var checked = $(this).prop("checked");
    
    options[optionName] = checked;

    $hideItemReplies.prop("disabled", !options.hideItems);
    $displayAgeColors.prop("disabled", !options.displayAge);

    console.log("Input changed: " + optionName + " -> " + checked);
    
    saveOptions(console.log);  
  });

  $("input.ageLimit").on("change", function (){
    options.years = $('#years').val();
    options.months = $('#months').val();
    options.days = $('#days').val();
    console.log("Input changed: " + options.years + "Y " + options.months + "M " + options.days);

    // Recalculate age limit
    ageLimit = (  (options.years * 365.25) 
                + (options.months * 30)
                + (options.days ) ) * secPerDay;
    options.ageLimit = ageLimit;

    
    saveOptions(console.log);  
  });

  $("#revokeButton").on("click", function(){
    console.log("Revoking Refresh Token...");
    snoo = new snoowrap({
                    userAgent: USERAGENT,
                    clientId: CLIENTID,
                    refreshToken: options.refresh_token,
                    clientSecret: "nonce"
                  });
    if(!!snoo){
      snoo.revokeRefreshToken();
      options.refresh_token = "";
      saveOptions(console.log);
    }
  })

}

function saveOptions(callback){
  chrome.storage.local.set(options, function(){
      chrome.storage.local.get(Object.keys(options), callback);
    });
  return;
}

(function(){
  console.log("Loading options...");
  loadOptions(onLoadOptionsPopup);
})();