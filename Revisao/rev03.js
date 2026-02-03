const nome = prompt("Digite seu nome");

function limparNomeContato(nome) {
    let junto = nome.trim().toUpperCase();

    let palavras = nome.split(' ').length;

    alert(`Aqui está a frase tudo Maiusculo: ${junto}`);
    alert(`Aqui está o prompt original ${nome}`);
    alert(`Aqui está o total de palavras do prompt ${palavras}`);

}

limparNomeContato(nome);
    // alert(`Aqui está a frase tudo junto: ${junto}`);
    // alert(`Aqui está a frase em maiuscula: ${maiusculo}`);
    // alert(`Aqui está o prompt original ${nome}`);
    // alert(`Aqui está o total de palavras do prompt ${contador}`);
