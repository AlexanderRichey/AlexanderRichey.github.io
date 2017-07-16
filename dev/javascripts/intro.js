export default function intro() {
  const introText = "I'm a software developer... >> Scroll for cool stuff!";
  const lineOne = 'line-one';
  const lineTwo = 'line-two';

  let i = 0;
  let current = lineOne;
  const intervalToken = setInterval(() => {
    if (i === introText.length) {
      document.getElementById('arrow').style.opacity = 1;
      return clearInterval(intervalToken);
    }
    if (i > 27) current = lineTwo;
    document.getElementById(current).innerHTML += introText[i];
    i += 1;
  }, 50);
}
