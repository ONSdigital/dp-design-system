const toggleAttribute = (el, attr) => {
  el.setAttribute(attr, el.getAttribute(attr) === 'true' ? 'false' : 'true');
};

document.addEventListener('DOMContentLoaded', function () {
  const nav = document.getElementById('nav-mobile');
  const btnMenu = document.getElementById('btn-menu');
  const btnMenuArrow = document.getElementById('btn-menu-arrow');
  const menuSection = document.querySelectorAll('.nav-mobile-btn');

  btnMenu.addEventListener('click', function () {
    nav.classList.toggle('hidden');
    btnMenuArrow.classList.toggle('rotate-180');

    toggleAttribute(btnMenu, 'aria-expanded');
  });

  menuSection.forEach((sectionBtn) =>
    sectionBtn.addEventListener('click', () => {
      const index = sectionBtn.getAttribute('data-index');
      const subMenu = document.getElementById(`nav-mobile-section-${index}`);

      sectionBtn.querySelector('svg').classList.toggle('-rotate-90');
      subMenu.classList.toggle('hidden');

      toggleAttribute(sectionBtn, 'aria-expanded');
      toggleAttribute(subMenu, 'aria-hidden');
    })
  );
});
