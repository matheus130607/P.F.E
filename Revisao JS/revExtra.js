const agendaHorarios = [8, 12, 25, 15, 2, 20];
let valido = 0;
let invalido = 0;

for (const agenda of agendaHorarios ) {

    if(agenda > 0 && agenda < 23) {
        alert(`Compromisso agendado para as ${agenda}`)
        valido++;

    } else {
        alert(`Atenção: O horário ${agenda} é inválido!.`)
        invalido++;

    }
}

    alert(`Compromissos validos: ${valido}`);
    alert(`Compromissos invalidos: ${invalido}`);