let menu = document.querySelector("#menu-btn");
let navbar = document.querySelector(
  ".main-header__nav .main-header__item-list"
);

menu.onclick = () => {
  menu.classList.toggle("fa-times");
  navbar.classList.toggle("active");
};
window.onscroll = () => {
  menu.classList.remove("fa-times");
  navbar.classList.remove("active");
};
