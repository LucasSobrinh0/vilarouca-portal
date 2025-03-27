const toggleBtn = document.getElementById('toggleSidebarBtn');
const sidebarMenu = document.getElementById('sidebarMenu');

toggleBtn.addEventListener('click', () => {
  sidebarMenu.classList.toggle('open');
});