"use strict";

// =========================================
// 1. CARRUSEL DE SERVICIOS
// =========================================

const carrusel = document.getElementById("carruselServicios");
const pista = document.getElementById("pistaServicios");
const botonAnterior = document.getElementById("serviciosAnterior");
const botonSiguiente = document.getElementById("serviciosSiguiente");
const contenedorIndicadores = document.getElementById("indicadoresServicios");
const estadoCarrusel = document.getElementById("estadoCarrusel");

const tarjetas = pista
    ? Array.from(pista.querySelectorAll(".tarjeta"))
    : [];

let posicionActual = 0;
let tarjetasVisibles = 3;

function calcularTarjetasVisibles() {
    if (window.matchMedia("(max-width: 650px)").matches) {
        return 1;
    }

    if (window.matchMedia("(max-width: 1000px)").matches) {
        return 2;
    }

    return 3;
}

function obtenerPosicionMaxima() {
    return Math.max(0, tarjetas.length - tarjetasVisibles);
}

function crearIndicadores() {
    if (!contenedorIndicadores) {
        return;
    }

    contenedorIndicadores.replaceChildren();
    const posicionMaxima = obtenerPosicionMaxima();

    for (let i = 0; i <= posicionMaxima; i++) {
        const indicador = document.createElement("button");
        indicador.type = "button";
        indicador.classList.add("indicador");
        indicador.setAttribute(
            "aria-label",
            `Mostrar servicios desde la posición ${i + 1}`
        );

        indicador.addEventListener("click", function () {
            posicionActual = i;
            actualizarCarrusel();
        });

        contenedorIndicadores.appendChild(indicador);
    }
}

function actualizarCarrusel() {
    if (!pista || tarjetas.length === 0) {
        return;
    }

    const posicionMaxima = obtenerPosicionMaxima();
    posicionActual = Math.max(0, Math.min(posicionActual, posicionMaxima));

    const anchoTarjeta = tarjetas[0].getBoundingClientRect().width;
    const espacio = parseFloat(window.getComputedStyle(pista).columnGap) || 0;
    const desplazamiento = posicionActual * (anchoTarjeta + espacio);

    pista.style.transform = `translateX(-${desplazamiento}px)`;

    if (botonAnterior) {
        botonAnterior.disabled = posicionActual === 0;
    }

    if (botonSiguiente) {
        botonSiguiente.disabled = posicionActual === posicionMaxima;
    }

    if (contenedorIndicadores) {
        const indicadores = Array.from(contenedorIndicadores.children);

        indicadores.forEach(function (indicador, indice) {
            const activo = indice === posicionActual;
            indicador.classList.toggle("activo", activo);

            if (activo) {
                indicador.setAttribute("aria-current", "true");
            } else {
                indicador.removeAttribute("aria-current");
            }
        });
    }

    if (estadoCarrusel) {
        const primeraTarjeta = posicionActual + 1;
        const ultimaTarjeta = Math.min(
            posicionActual + tarjetasVisibles,
            tarjetas.length
        );

        estadoCarrusel.textContent =
            `Mostrando servicios ${primeraTarjeta}–${ultimaTarjeta} ` +
            `de ${tarjetas.length}`;
    }
}

function adaptarCarrusel() {
    tarjetasVisibles = calcularTarjetasVisibles();
    posicionActual = Math.min(posicionActual, obtenerPosicionMaxima());
    crearIndicadores();
    actualizarCarrusel();
}

if (carrusel && pista && tarjetas.length > 0) {
    if (botonAnterior) {
        botonAnterior.addEventListener("click", function () {
            if (posicionActual > 0) {
                posicionActual--;
                actualizarCarrusel();
            }
        });
    }

    if (botonSiguiente) {
        botonSiguiente.addEventListener("click", function () {
            if (posicionActual < obtenerPosicionMaxima()) {
                posicionActual++;
                actualizarCarrusel();
            }
        });
    }

    window.addEventListener("resize", adaptarCarrusel);
    adaptarCarrusel();
}

// =========================================
// 2. TABLERO FLOTANTE DEL DÓLAR (USD / COP)
// =========================================

const elementoValorDolar = document.getElementById("valorDolar");
const elementoEstadoDolar = document.getElementById("estadoDolar");

function formatearPesos(valor) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 2
    }).format(valor);
}

async function obtenerDolarHoy() {
    if (!elementoValorDolar || !elementoEstadoDolar) {
        return;
    }

    try {
        const respuesta = await fetch("https://open.er-api.com/v6/latest/USD");
        if (!respuesta.ok) {
            throw new Error("Respuesta no válida de la API");
        }

        const datos = await respuesta.json();
        const tasaCop = datos && datos.rates ? datos.rates.COP : null;

        if (!tasaCop) {
            throw new Error("No se encontró la tasa COP");
        }

        elementoValorDolar.textContent = formatearPesos(tasaCop);
        elementoEstadoDolar.textContent = "Actualizado hoy";
    } catch (error) {
        elementoValorDolar.textContent = "No disponible";
        elementoEstadoDolar.textContent = "Error al consultar";
    }
}

obtenerDolarHoy();