document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelectorAll('.cookies-no-js').length > 0) {
    document.querySelectorAll('.cookies-no-js').forEach((item) => item.classList.add('hidden'));
  }
  if (document.querySelectorAll('.cookies-js').length > 0) {
    document.querySelectorAll('.cookies-js').forEach((item) => item.classList.remove('hidden'));
  }
});
