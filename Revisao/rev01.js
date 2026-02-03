perg1 = prompt("Digite a hora da atividade entre 0 e 23:");
perg2 = prompt("Digite a prioridade da atividade entre 0 e 10:");
    
    if(perg1 >= 0 && perg1 <= 11){
        if(perg2 > 8 ){
            alert("Horário: Manhã\nPrioridade: CRÍTICA/URGENTE");
        }
        else if(perg2 >= 7) {
            alert("Horário: Manhã\nPrioridade: TAREFA IMPORTANTE");
        }
        else if (perg2 >= 1 && perg2 <=6) {
            alert("Horário: Manhã\nPrioridade: TAREFA NÃO IMPORTANTE");
        }
        else {
            alert("Horário: Manhã\nPrioridade: INVÁLIDA");
        }
    }

    else if(perg1 >= 12 && perg1 <=17) {
        if(perg2 > 8 ){
            alert("Horário: Tarde\nPrioridade: CRÍTICA/URGENTE");
        }
        else if(perg2 >= 7) {
            alert("Horário: Tarde\nPrioridade: TAREFA IMPORTANTE");
        }
        else if (perg2 >= 1 && perg2 <=6){
            alert("Horário: Tarde\nPrioridade: TAREFA NÃO IMPORTANTE");
        }
        else {
            alert("Horário: Manhã\nPrioridade: INVÁLIDA");
        }
    }

    else if(perg1 >= 18 && perg1 <=23) {
        if (perg2 >= 1 && perg2 <= 10){
            alert("Horário: Noite\nPrioridade: TAREFA NÃO IMPORTANTE");
        }
        else {
            alert("Horário: Noite\nPrioridade: INVÁLIDA");
        }
    }

    else {
        alert("Horário ou Prioridade INVÁLIDA")
    }
    
