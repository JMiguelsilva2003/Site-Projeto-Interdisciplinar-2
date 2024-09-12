import { db } from '../firebase-config.js';
import { collection, query, where, getDocs, getDoc, doc } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
import { getFirstTwoNames } from '../utilidades.js';

function loadMenuDireito() {
    ajustarmonitoresLogados();
    ajustarAmigoLogados();
    //document.getElementById('link-amigos').addEventListener('click', function () {
    //    unloadHTML('conteudo_principal');
    //    loadHTML("../Paginas/telaDeAmigos.php", "../Styles/estilo_tela-de-amigos.css", "conteudo_principal");
    // });
}

async function ajustarAmigoLogados() {
    const auth = getAuth();
    const agora = new Date().getTime();
    const cincoMinutos = 5 * 60 * 1000;
    const umMinutoAtras = agora - 3 * 60000;
    const dadosSalvos = JSON.parse(localStorage.getItem('usuariosAmigos'));
    const tempoSalvo = localStorage.getItem('tempoSalvo');
    if (dadosSalvos && tempoSalvo && (agora - tempoSalvo < cincoMinutos)) {
        ajustarAmigo(dadosSalvos);
    } else {
        const listaamigos = window.sessionData.userInfo.listaAmigos || [];
        const usuarios = [];
        for (const amigo of listaamigos) {
            const docRef = doc(db, "InforConta", amigo);
            if (docRef) {
                const doc = await getDoc(docRef);
                const data = doc.data();
                if (data.dataacesso && (data.dataacesso > umMinutoAtras)) {
                    usuarios.push(data);
                }
            }
        }
        localStorage.setItem('usuariosAmigos', JSON.stringify(usuarios));
        ajustarAmigo(usuarios);
    }
}


async function ajustarmonitoresLogados() {
    //console.log(window.sessionData);

    const auth = getAuth();
    const agora = new Date().getTime();
    const cincoMinutos = 1 * 60 * 1000;
    const umMinutoAtras = agora - 3 * 60000;
    const dadosSalvos = JSON.parse(localStorage.getItem('usuariosMonitores'));
    const tempoSalvo = localStorage.getItem('tempoSalvo');
    if (dadosSalvos && tempoSalvo && (agora - tempoSalvo < cincoMinutos)) {
        ajusteMonito(dadosSalvos);
        console.log('Dados carregados do localStorage');
    } else {
        const inforConta = collection(db, 'InforConta');
        const q = query(
            inforConta,
            where('tipoConta', 'in', ['Monitor', 'Professor'])
        );
        const usuarios = [];
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.dataacesso && data.dataacesso > umMinutoAtras) {
                usuarios.push(doc.data());
            }
        });

        // Salvar os dados no localStorage
        localStorage.setItem('usuariosMonitores', JSON.stringify(usuarios));
        localStorage.setItem('tempoSalvo', agora);
        ajusteMonito(usuarios);
        console.log('Dados carregados do Firestore');
    }
}

function ajusteMonito(dadosSalvos) {
    const usuariosLogados = document.getElementById('listagemdeMonitores');
    usuariosLogados.innerHTML = '';

    if (dadosSalvos.length === 0) {
        const aviso = document.createElement('div');
        aviso.classList.add('aviso');
        aviso.innerHTML = '<p>Não há monitores online no momento.</p>';
        usuariosLogados.appendChild(aviso);
    } else {
        dadosSalvos.forEach((usuario) => {
            const usuarioLogado = document.createElement('div');
            if (usuario.tipoConta === 'Professor') {
                usuarioLogado.classList.add('usuarioLogadoprofessor');
            } else {
                usuarioLogado.classList.add('usuarioLogado');
            }
            usuarioLogado.innerHTML = `
                <img src="${usuario.fotoPerfil || '../Recursos/Imagens/perfil-teste.avif'}" alt="Foto de perfil">
                <div>
                    <h3>${getFirstTwoNames(usuario.nome)}</h3>
                    <p>${usuario.email}</p>
                </div>
            `;
            usuariosLogados.appendChild(usuarioLogado);
        });
    }
}

function ajustarAmigo(dadosSalvos) {
    const usuariosLogados = document.getElementById('diferente');
    usuariosLogados.innerHTML = '';
    if (dadosSalvos.length === 0) {
        const aviso = document.createElement('div');
        aviso.classList.add('aviso');
        aviso.innerHTML = '<p>Nenhum amigo online no momento.</p>';
        usuariosLogados.appendChild(aviso);
    } else {
        dadosSalvos.forEach((usuario) => {
            const amigoItem = document.createElement('div');
            amigoItem.classList.add('usuarioLogado');
            amigoItem.innerHTML = `
            <img src="${usuario.fotoPerfil || '../Recursos/Imagens/perfil-teste.avif'}" alt="Foto de perfil">
            <div>
                <h3>${getFirstTwoNames(usuario.nome)}</h3>
                <p>${usuario.email}</p>
            </div>
        `;
            usuariosLogados.appendChild(amigoItem);
        });
    }
}



/*
async function ajustarAmigoLogados() {
    const inforConta = collection(db, 'InforConta');
    const q = query(inforConta, where('tipoConta', '==', 'Monitor'));
    const usuarios = [];
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        usuarios.push(doc.data());
    });
    const usuariosLogados = document.getElementById('diferente');
    usuariosLogados.innerHTML = '';
    usuarios.forEach((usuario) => {
        const amigoItem = document.createElement('div');
        amigoItem.classList.add('amigoItem');
        amigoItem.innerHTML = `
            <img src="${usuario.fotoPerfil || '../Recursos/Imagens/perfil-teste.avif'}" alt="Foto de perfil">
            <div>
                <h2>${usuario.nome}</h2>
                <p>${amigo.mensagemRecente || 'Nenhuma mensagem recente'}</p>
            </div>
        `;
        usuariosLogados.appendChild(amigoItem);
    });
}  
    */

export { loadMenuDireito };