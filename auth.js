window.browser = (function () {
  return window.msBrowser ||
    window.browser ||
    window.chrome;
})();

// App constants
const USERAGENT = "extension:com.github.celinehagbard.account-filter:v0.1 (by u/CelineHagbard";
const CLIENTID = "HdNNGQaEVUwNxQ";
const ACCESS_URL = "https://www.reddit.com/api/v1/access_token";
const REDIRECT = 'https://www.reddit.com';

const secPerDay = 24 * 60 * 60;

const optionDefaults = { 
          refresh_token: "",
          ageLimit: 12 * 30 * secPerDay, // Age in seconds; default ~= 12 months
          years: 1,
          months: 0,
          days: 0,
          hideItems: true,
          hideItemReplies: false, 
          displayAge: true,
          displayAgeColors: true
        };

function loadOptions(callback){
  chrome.storage.local.get(optionDefaults, callback); 
}

function startOAuthFlow(){
  let authenticationUrl = snoowrap.getAuthUrl({
                            clientId: 'HdNNGQaEVUwNxQ',
                            scope: ['identity','read', 'privatemessages'],
                            redirectUri: REDIRECT,
                            permanent: true,
                            state: 'fe211bebc52eb3da9bef8db6e63104d3' 
  });

  console.log(authenticationUrl);
  window.location = authenticationUrl;
  console.log("Set window.location to authenticationUrl.");
}

function getRefreshToken(code){
  let form = new FormData();
  form.set('grant_type', 'authorization_code');
  form.set('code', code);
  form.set('redirect_uri', REDIRECT);

  let headers = new Headers();
  headers.append('Authorization', 'Basic ' + btoa(CLIENTID + ":"));

  fetch(ACCESS_URL, {
        method: 'post',
        body: form,
        headers: headers, 
      }).then(function(response){
        if (!response.ok){
          console.log("Authorization request failed: " + response.status);
          return;
        } else {
          console.log("Refresh Token Received: " + response.status);
          return response.json();
        }
      }).then(function(data){
        let refresh_token = data["refresh_token"];
        console.log("Received refresh_token: " + refresh_token);

        chrome.storage.local.set({refresh_token: refresh_token}, function(){
          if (chrome.runtime.lastError != undefined){
            console.log("Error saving refresh_token in storage: " + chrome.runtime.lastError);
          }
          else{
            console.log("Refresh Token set in storage: " );
            window.location = "https://www.reddit.com/";

          }
        });

      });     

}