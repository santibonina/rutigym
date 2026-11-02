const USERS_KEY = 'rutigym.users.v1';
const SESSION_KEY = 'rutigym.session.v1';
const PASSWORD_ITERATIONS = 210000;

function getUsers() {
    const storedUsers = localStorage.getItem(USERS_KEY);
    if (!storedUsers) {
        return [];
    }

    const users = JSON.parse(storedUsers);
    if (!Array.isArray(users)) {
        throw new Error('No se pudieron leer las cuentas guardadas en este navegador.');
    }

    return users;
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function bytesToHex(bytes) {
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password, salt) {
    if (!window.crypto || !window.crypto.subtle) {
        throw new Error('Este navegador no permite proteger la contraseña. Abrí el sitio desde localhost o una conexión segura.');
    }

    const passwordKey = await window.crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );
    const derivedBits = await window.crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt,
            iterations: PASSWORD_ITERATIONS,
            hash: 'SHA-256'
        },
        passwordKey,
        256
    );

    return bytesToHex(new Uint8Array(derivedBits));
}

function findCurrentUser(users) {
    const activeEmail = localStorage.getItem(SESSION_KEY);
    if (!activeEmail) {
        return null;
    }

    return users.find(user => user.email === activeEmail) || null;
}

function showAuthMessage(message, type) {
    const status = document.getElementById('auth-message');
    if (!status) {
        return;
    }

    status.textContent = message;
    status.classList.add('is-visible');
    status.classList.toggle('is-error', type === 'error');
    status.classList.toggle('is-success', type === 'success');
}

function addMenuLink(menu, href, label) {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    menu.appendChild(link);
}

function renderUserMenu() {
    const userIcon = document.querySelector('.usuario');
    const menu = document.querySelector('.menu-usuario');
    if (!userIcon || !menu) {
        return;
    }

    if (!menu.dataset.loginHref || !menu.dataset.registerHref) {
        const initialLinks = Array.from(menu.querySelectorAll('a'));
        menu.dataset.loginHref = initialLinks[0] ? initialLinks[0].href : '';
        menu.dataset.registerHref = initialLinks[1] ? initialLinks[1].href : '';
    }

    const loginHref = menu.dataset.loginHref;
    const registerHref = menu.dataset.registerHref;
    const currentUser = findCurrentUser(getUsers());
    menu.replaceChildren();

    if (currentUser) {
        const greeting = document.createElement('p');
        greeting.textContent = `Hola, ${currentUser.username}`;
        menu.appendChild(greeting);

        const logoutButton = document.createElement('button');
        logoutButton.type = 'button';
        logoutButton.dataset.logout = 'true';
        logoutButton.textContent = 'Cerrar sesión';
        menu.appendChild(logoutButton);
        userIcon.setAttribute('aria-label', `Menú de usuario de ${currentUser.username}`);
        return;
    }

    if (loginHref) {
        addMenuLink(menu, loginHref, 'Iniciar Sesión');
    }
    if (registerHref) {
        addMenuLink(menu, registerHref, 'Registrarse');
    }
    userIcon.setAttribute('aria-label', 'Menú de usuario');
}

async function registerAccount(form) {
    const username = form.elements.nombre.value.trim();
    const email = form.elements.email.value.trim().toLowerCase();
    const password = form.elements.clave.value;
    const users = getUsers();

    if (!username) {
        throw new Error('Ingresá un nombre de usuario.');
    }
    if (users.some(user => user.username.toLowerCase() === username.toLowerCase())) {
        throw new Error('Ese nombre de usuario ya está registrado.');
    }
    if (users.some(user => user.email === email)) {
        throw new Error('Ya existe una cuenta con ese email.');
    }

    if (!window.crypto || !window.crypto.subtle) {
        throw new Error('Este navegador no permite proteger la contraseña. Abrí el sitio desde localhost o una conexión segura.');
    }

    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const user = {
        username,
        email,
        salt: bytesToHex(salt),
        passwordHash: await hashPassword(password, salt)
    };

    users.push(user);
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, email);
    renderUserMenu();
    form.reset();
    showAuthMessage(`¡Cuenta creada! Iniciaste sesión como ${username}.`, 'success');
}

async function signIn(form) {
    const identifier = form.elements.usuario.value.trim().toLowerCase();
    const password = form.elements.clave.value;
    const user = getUsers().find(account =>
        account.email === identifier || account.username.toLowerCase() === identifier
    );

    if (!user) {
        throw new Error('Usuario o contraseña incorrectos.');
    }

    const salt = Uint8Array.from(user.salt.match(/.{2}/g), byte => parseInt(byte, 16));
    const passwordHash = await hashPassword(password, salt);
    if (passwordHash !== user.passwordHash) {
        throw new Error('Usuario o contraseña incorrectos.');
    }

    localStorage.setItem(SESSION_KEY, user.email);
    const nextPage = new URLSearchParams(window.location.search).get('next');
    const nextUrl = ['seguimiento.html', 'desafios.html'].includes(nextPage)
        ? new URL(nextPage, window.location.href)
        : new URL('../index.html', window.location.href);
    window.location.href = nextUrl.href;
}

document.addEventListener('DOMContentLoaded', function () {
    const userIcon = document.querySelector('.usuario');
    const menu = document.querySelector('.menu-usuario');
    const menuToggle = document.getElementById('menu-toggle');
    const menuButton = document.querySelector('.menu-btn');
    const sidebar = document.querySelector('.sidebar');
    const menuOverlay = document.querySelector('.overlay');

    if (userIcon && menu) {
        renderUserMenu();

        const toggleUserMenu = function () {
            const isOpen = menu.classList.toggle('show');
            userIcon.setAttribute('aria-expanded', String(isOpen));
        };

        userIcon.addEventListener('click', function (event) {
            event.stopPropagation();
            toggleUserMenu();
        });

        userIcon.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleUserMenu();
            }
        });

        menu.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                menu.classList.remove('show');
                userIcon.setAttribute('aria-expanded', 'false');
                userIcon.focus();
            }
        });

        window.addEventListener('storage', function (event) {
            if (event.key === USERS_KEY || event.key === SESSION_KEY) {
                renderUserMenu();
            }
        });

        menu.addEventListener('click', function (event) {
            event.stopPropagation();
            if (event.target.closest('[data-logout]')) {
                localStorage.removeItem(SESSION_KEY);
                renderUserMenu();
            }
        });
    }

    if (menuToggle && menuButton) {
        menuToggle.addEventListener('change', function () {
            menuButton.setAttribute('aria-expanded', String(menuToggle.checked));
        });

        menuButton.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                menuToggle.checked = !menuToggle.checked;
                menuToggle.dispatchEvent(new Event('change'));
            }
        });
    }

    document.addEventListener('pointerdown', function (event) {
        const target = event.target;

        if (menu && userIcon && !userIcon.contains(target) && !menu.contains(target)) {
            menu.classList.remove('show');
            userIcon.setAttribute('aria-expanded', 'false');
        }

        if (
            menuToggle &&
            menuButton &&
            sidebar &&
            menuToggle.checked &&
            !(menuOverlay && menuOverlay.contains(target)) &&
            !sidebar.contains(target) &&
            !menuButton.contains(target)
        ) {
            menuToggle.checked = false;
            menuToggle.dispatchEvent(new Event('change'));
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape') {
            return;
        }

        if (menu && userIcon) {
            menu.classList.remove('show');
            userIcon.setAttribute('aria-expanded', 'false');
        }

        if (menuToggle && menuButton && menuToggle.checked) {
            menuToggle.checked = false;
            menuToggle.dispatchEvent(new Event('change'));
            menuButton.focus();
        }
    });

    const registrationForm = document.getElementById('registro-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const submitButton = registrationForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            try {
                await registerAccount(registrationForm);
            } catch (error) {
                showAuthMessage(error.message || 'No se pudo crear la cuenta.', 'error');
            } finally {
                submitButton.disabled = false;
            }
        });
    }

    const signInForm = document.getElementById('iniciar-sesion-form');
    if (signInForm) {
        signInForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const submitButton = signInForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            try {
                await signIn(signInForm);
            } catch (error) {
                showAuthMessage(error.message || 'No se pudo iniciar sesión.', 'error');
            } finally {
                submitButton.disabled = false;
            }
        });
    }
});
