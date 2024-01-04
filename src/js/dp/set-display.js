function setDisplay() {
  document.querySelectorAll('.js--hide').forEach((element) => {
    const el = element;
    el.style.display = 'none';
  });
  document.querySelectorAll('.js--show').forEach((element) => {
    const el = element;
    el.style.display = 'block';
  });
  document.querySelectorAll('.nojs--hide').forEach((element) => {
    const el = element;
    el.classList.remove('nojs--hide');
  });
}

document.addEventListener('DOMContentLoaded', setDisplay);
