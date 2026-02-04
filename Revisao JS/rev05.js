const agendaHorarios = [8, 12, 25, 15, 2, 20];

for (const agenda of agendaHorarios ) {

    if(agenda > 0 && agenda < 23) {
        alert(`Compromisso agendado para as ${agenda}`)

    } else {
        alert(`Atenção: O horário ${agenda} é inválido!.`)

    }
}