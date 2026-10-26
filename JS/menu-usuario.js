// Activa el menú del usuario después de que el HTML está listo.
document.addEventListener('DOMContentLoaded', function () {
    const usuarioIcono = document.querySelector('.usuario');
    const menuUsuario = document.querySelector('.menu-usuario');

    if (usuarioIcono && menuUsuario) {
        // El icono abre/cierra el menú; un clic fuera lo cierra.
        usuarioIcono.addEventListener('click', function (event) {
            event.stopPropagation();
            menuUsuario.classList.toggle('show');
        });

        document.addEventListener('click', function () {
            menuUsuario.classList.remove('show');
        });

        menuUsuario.addEventListener('click', function (event) {
            event.stopPropagation();
        });
    }
});
