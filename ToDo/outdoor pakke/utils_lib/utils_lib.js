export function sayHi(user) {
  console.log(`Hello, ${user}!`);
}
export function getRandomNumber(max) {
  return Math.floor(Math.random() * max);
}

export function $(element) {
  return document.querySelector(element);
}

export async function loadJSON(url,callback){
  const response = await fetch(url);
  const jsonData = await response.json();
  callback(jsonData);
}

