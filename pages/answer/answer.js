import { addData, getData, onGetData, updateData } from "../../services/crudservice.js";
import { respuestas as respuestasSave} from "../../models/respuestas.js";
const cardForms = document.getElementById("cardForms");
const titulo = document.getElementById('nombreFormulario');
const timer = document.getElementById('tiempo');
const btn = document.getElementById('siguiente');
const id = localStorage.getItem("idformuser");
const idAsignacion = localStorage.getItem('idAsignacion');
const cerrarSesion = document.getElementById('cerrarSesion');
const idUser  = JSON.parse(localStorage.getItem('user'));

let pregunta = 0;
let preguntasform = [];
let s = 0;
const respuestas = [];
let varemo = '';
let respuestasFinales
let asignacionActualizada = false;

const tiempo = (s) => {
  setInterval(function () {
    var hour = Math.floor(s / 3600);
    hour = (hour < 10) ? '0' + hour : hour;
    var minute = Math.floor((s / 60) % 60);
    minute = (minute < 10) ? '0' + minute : minute;
    var second = s % 60;
    second = (second < 10) ? '0' + second : second;
    timer.innerText = hour + ':' + minute + ':' + second
    s = s - 1
    if(s==0){
      terminarFormulario()
    }
  }, 1000)
}

window.onbeforeunload = function() {
  return "¿Estás seguro que deseas salir de la actual página?"
}

const cargarpregunta = (pregunta) => {
  cardForms.innerHTML = '';
  varemo = preguntasform[pregunta].varemo;
    $(cardForms).append(`
        <div class="card">
          <div class="card-body" id="${pregunta}">
            <h5 class="card-title">${preguntasform[pregunta].nombrePregunta}</h5>
            ${cargarRespuestas(pregunta, preguntasform[pregunta].respuestas,preguntasform[pregunta].tipoDeRespuesta)}
          </div>
        </div>
          `);
}

const formulario = async () => {
  const form = await getData(id, 'formularios');
  titulo.innerText = form.data().nombre;
  preguntasform = form.data().preguntas;
  cargarpregunta(pregunta);
  s=form.data().tiempo;
  tiempo(s);
}

formulario();

const cargarRespuestas = (index, respuestas,tipoRespuesta) =>{
  let lista = '';
  console.log(tipoRespuesta);
  if(tipoRespuesta == "seleccion unica"){
  respuestas.forEach(respuesta =>{
      lista = lista +  `
      <div class="form-check">
      <input class="form-check-input" type="radio" name="${index}" id="${respuesta.index}" value=${respuesta.index}>
      <label class="form-check-label" >
        ${respuesta.respuesta}
      </label>
      </div>
      
  `
  })
}else{
  respuestas.forEach(respuesta =>{
    lista = lista +  `
    <div class="form-check">
    <input class="form-check-input" type="checkbox" name="${index}" id="${respuesta.index}" value=${respuesta.index}>
    <label class="form-check-label" >
      ${respuesta.respuesta}
    </label>
    </div>
    
`
})
}

  return lista
}
function validacionRespuesta (){
  try {
    const radios = document.getElementsByName(pregunta);
  let valor = '';
  for (let i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      valor = radios[i].value;
    }
  }
  if(valor != ''){
  let respuesta = $(`input:radio[name=${pregunta}]:checked`).val();
  console.log(respuesta);
  respuesta = parseInt(respuesta,10);
  respuestas.push({
    index:pregunta,
    respuesta:[respuesta],
    varemo
  });
  pregunta++
  cargarpregunta(pregunta)
  return true
  }else{
    alert('Seleccione una respuesta')
    return false;
  }
  } catch (error) {
      console.log(error);
  }
  
}
function ultimaRespuesta (validacion){
  if(pregunta == preguntasform.length-1){
    btn.innerText = 'Finalizar'
    btn.onclick = () => {
      if(validacion){ 
        terminarFormulario()

      }
  }  
}
}
btn.addEventListener('click', ()=>{
  let validacion = false
  validacion = validacionRespuesta();
  ultimaRespuesta(validacion)
})  

const actualizarAsignacion = async () => {
  return new Promise(resolve =>{
  onGetData((asignaciones) => {  
     asignaciones.forEach(asignacion => {
      if(asignacion.data().formulario == id){
        let dataUser = asignacion.data().usuario
        for (let i = 0; i < dataUser.length; i++) {
          const element = dataUser[i];
          if (dataUser[i].id == idUser.id) {
              let ubicacion = dataUser.indexOf(element)
              if (ubicacion !== -1) {
                dataUser.splice(ubicacion, 1);
                dataUser.push({id:idUser.id,
                  resuelto:true,}) 
            }
            
              updateData(idAsignacion, {usuario:dataUser},'asignaciones')
          }
        }
       }
      });
      asignacionActualizada = true;
      resolve()
    }, 'asignaciones');
  });
}

  async function terminarFormulario() {
    respuestasFinales = JSON.stringify(respuestas);
    respuestasSave.formulario = id;
    respuestasSave.usuario = idUser.id;
    respuestasSave.respuestas = respuestas;
    await actualizarAsignacion();
    addData(respuestasSave, 'respuestas');
    // revisar toca tomar el id del usuario para actualizarlo
    
    const interval = setInterval(() => {
      if (asignacionActualizada) {
        clearInterval(interval); // detener el intervalo
        window.location.href = '/pages/formsAnswer/formAnswer.html'; // redirigir
      }
    }, 100); 
  }
  cerrarSesion.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('user');
    location.href = '/..';
})
// End of pages\answer\answer.js
