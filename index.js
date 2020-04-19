addEventListener('fetch', event => {
  event.respondWith(getData(event.request));
});
// store datasource
let dataSource = [];
// map for components in random variant page 1
let changeURL1String = new Map();
changeURL1String.set('title', 'Duy Trieu github');
changeURL1String.set('h1#title', 'Duy Trieu github');
changeURL1String.set('p#description', 'This links to Duy Trieu github');
changeURL1String.set('a#url', 'To github link');
changeURL1String.set('a#href', 'https://github.com/DuyTrieu1999');
// map for components in random variant page 2
let changeURL2String = new Map();
changeURL2String.set('title', 'Duy Trieu linkedin');
changeURL2String.set('h1#title', 'Duy Trieu linkedin');
changeURL2String.set('p#description', 'This links to my linkedin');
changeURL2String.set('a#url', 'To linkedin link');
changeURL2String.set('a#href', 'https://www.linkedin.com/in/duy-trieu-77b81b140/');

async function getData(request) {
  try {
    const response = await fetch('https://cfw-takehome.developers.workers.dev/api/variants')
    dataSource = await response.json()
  } catch (err) {
    console.log(err)
  }
  return await distributeReq(dataSource, request)
}

// get random function
function getRandomArbitrary(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// distribute the request randomly, answers for question 2 and 3
async function distributeReq(jsonString, request) {
  // cookie generated from random
  const variantCookie = parseInt(getCookie(request, "first cookie"));
  // cookie generated from refresh
  const refresh = getCookie(request, "refresh");
  const random = await getRandomArbitrary(0, 1);
  // check if this is the first opening of application
  const urlIndex = isNaN(variantCookie) ? random : refresh == null ? variantCookie - 1 : random;
  const response = await fetch(jsonString.variants[random]);
  const html = await response.text();
  const cur = new Response(html, {
    headers: { 'content-type': 'text/html' },
  });
  if (random == 0) {
    return changeURL(cur, changeURL1String, urlIndex, refresh)
  }
  else {
    return changeURL(cur, changeURL2String, urlIndex, refresh)
  }
}

// function changing html content and set cookies
async function changeURL(html, map, urlIndex, refresh) {
  var modified = new HTMLRewriter();
  for (const entry of map.entries()) {
    modified.on(entry[0],new ElementHandler(map))
  }
  const update = modified.transform(html);
  setCookie(update, "first cookie", urlIndex+1, 1000);
  if (refresh == null) {
    setCookie(update, "refresh", "refresh", null);
  }
  return update;
}

class ElementHandler {
  constructor(map){
    this.map = map
  }
  element(element) {
    const tagName = element.tagName;
    const id = element.getAttribute("id");
    var string = id ? this.map.get(tagName + "#" + id) : this.map.get(tagName);
    if(tagName === "a" && id === "url") {
      element.setAttribute("href",this.map.get('a#href'));
    }
    if (string) {
      element.setInnerContent(string)
    }
  }
}

function setCookie(res,name,value,days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days*24*60*60*1000));
    expires = "; expires=" + date.toUTCString();
  }
  res.headers.set('Set-Cookie', name + "=" + (value || "")  + expires + "; path=/")
}
function getCookie(request, name) {
  let result = null
  let cookieString = request.headers.get('Cookie');
  if (cookieString) {
    let cookies = cookieString.split(';');
    cookies.forEach(cookie => {
      let cookieName = cookie.split('=')[0].trim();
      if (cookieName === name) {
        let cookieVal = cookie.split('=')[1];
        result = cookieVal
      }
    })
  }
  return result
}


