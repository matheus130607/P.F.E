let sal = prompt("Digite seu salário: (EX = 1000,00)");
let alu = prompt("Digite seu aluguel: (EX = 1000,00)");
let ali = prompt("Digite quanto que você gasta de alimentação: (EX = 1000,00)");
let laz = prompt("Digite quanto que você gasta de lazer: (EX = 1000,00)");

let n1 = parseFloat(sal.replace(",", "."));
let n2 = parseFloat(alu.replace(",", "."));
let n3 = parseFloat(ali.replace(",", "."));
let n4 = parseFloat(laz.replace(",", "."));

let resul = n1 - (n2 + n3 + n4);

    if(resul > 0) {
        alert("Você tem o saldo positivo")
    }

    else if(resul == 0) {
        alert("Você tem o saldo no limite")
    }

    else {
        alert("Você tem o saldo negativo")
    }