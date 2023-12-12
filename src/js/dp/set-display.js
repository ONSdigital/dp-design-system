function setDisplay() {
  document.querySelectorAll('.js--hide').forEach((el) => {
    el.style.display = 'none';
  });
  document.querySelectorAll('.js--show').forEach((el) => {
    el.style.display = 'block';
  });
  document.querySelectorAll('.nojs--hide').forEach((el) => {
    el.classList.remove('nojs--hide');
  });
}

document.addEventListener('DOMContentLoaded', setDisplay);
