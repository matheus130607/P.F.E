let hoje = new Date();
let evento = new Date('2026-07-30');

let ms = evento.getTime() - hoje.getTime();

let dia = ms / 24 / 60 / 1000 / 60

let resu = Math.ceil(dia)
alert(` Falta ${dia} para o evento`)