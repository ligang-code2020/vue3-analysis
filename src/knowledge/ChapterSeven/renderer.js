export function renderer(domString, container) {
  container.innerHTML = domString;
}


renderer('<h1>Hello</h1>', document.getElementById('app'))



