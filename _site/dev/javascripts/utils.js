export const scrollTo = (dest, duration) => {
  let count = 0;
  const distance = dest - window.scrollY;
  const step = distance / (duration / 5);

  const intervalToken = setInterval(() => {
    window.scrollTo(0, window.scrollY + step);
    count += 1;
    if (count >= duration / 5) clearInterval(intervalToken);
  }, 5);
}
