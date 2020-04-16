let dataSource = [];

addEventListener('fetch', event => {
  event.respondWith(getData());
});

async function getData() {
  try {
    const response = await fetch('https://cfw-takehome.developers.workers.dev/api/variants')
    dataSource = await response.json()
  } catch (err) {
    console.log(err)
  }
  return await distributeReq(dataSource)
}

function getRandomArbitrary(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function distributeReq(jsonString) {
  const random = await getRandomArbitrary(0, 1);
  console.log(random);
  console.log(jsonString.variants );
  console.log(jsonString.variants[random]);
  const response = await fetch(jsonString.variants[random]);
  const html = await response.text();
  const cur = new Response(html, {
    headers: { 'content-type': 'text/html' },
  });
  if (random == 0) {
    return changeURL1(cur)
  }
  else {
    return changeURL2(cur)
  }
}
const changeURL2String = {
  titleChange: 'Something special',
  h1titleChange: 'Something surprising',
  pDescription: 'This links to something amazing',
  aUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  urlDescription: 'To amazing link'
};
const changeURL1String = {
  titleChange: 'Duy Trieu github',
  h1titleChange: 'Duy Trieu github',
  pDescription: 'This links to Duy Trieu github',
  aUrl: 'https://github.com/DuyTrieu1999',
  urlDescription: 'To github link'
};
async function changeURL1(html) {
  return new HTMLRewriter().on('title', new ElementHandler(changeURL1String)).transform(html)
}

async function changeURL2(html) {
  return new HTMLRewriter().on('title', new ElementHandler(changeURL2String)).transform(html)
}

class ElementHandler {
  constructor(countryStrings) {
    this.countryStrings = countryStrings
  }
  element(element) {
    // An incoming element, such as `div`
    console.log(`Incoming element: ${element.tagName}`);
    const titleChange = element.getAttribute('title');
    const h1title = element.getAttribute('h1#title');
    const desc = element.getAttribute('p#description');
    const url = element.getAttribute('a#url');
    if (titleChange) {
      const cur = this.countryStrings[titleChange];
      if (cur) {
        element.setInnerContent(cur)
      }
    }
  }
}
