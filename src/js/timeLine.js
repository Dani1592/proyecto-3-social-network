socialNetwork.initializeFirebase();
let db = firebase.firestore();// inciar firestore

document.getElementById('sign-out').addEventListener('click', event => {
  event.preventDefault();
  socialNetwork.signOut();
});

const getCurrentUserData = () => {// funcion que guarda la publicacion
  let userPhotoLink;
  let currentName;
  firebase.auth().onAuthStateChanged(user => {// observador, verificar si esta conectado
    if (user) {
      setUserProfile();
      document.getElementById('send-post').addEventListener('click', event => {
        event.preventDefault();
        let datePost = firebase.firestore.FieldValue.serverTimestamp();// para agarrar la fecha de firebase  y server es el que guarda la fecha
        const contentPost = document.getElementById('user-content-post').value;// para guardadr el valor del post que escribe
        if (contentPost !== '' && contentPost !== ' ') {// para verificar la foto que aparece en el post
          if (user.photoURL === null) {
            userPhotoLink = '../images/user-default2.jpg';// si no tiene pone la imagen por default
          } else {
            userPhotoLink = user.photoURL;// si no pone la foto de perfil
          }
          if (user.displayName === null) {// si el nombre esta vacio pone el correo
            currentName = user.email;
          } else {
            currentName = user.displayName;// si tiene imagen pone la imagen
          }
          db.collection('post').add({// entra a collection al post y luego agregalo
            userID: user.uid,
            userName: currentName,
            userPhoto: userPhotoLink,
            time: datePost,
            likes: [],
            content: contentPost
          }).then(result => {// si todo esto se cumple has esto
            swal({// esta es una libreria para las ventanas emergentes que salen
              confirmButtonText: 'Aceptar',
              type: 'success',
              title: 'Publicación exitosa'
            });
            document.getElementById('user-content-post').value = '';
            drawPostByUser();
          }).catch(error => {// el error
            console.error('Error adding document: ', error);
          });
        }
      });
    } else {
      location.href = ('../index.html');// si no es lo pasado regresalo al incio
    }
  });
};

const drawPostByUser = () => {
  firebase.auth().onAuthStateChanged(user => {// inicio firebase
    if (user) {
      const currentUserID = user.uid; // el id del usuario
      const postRef = db.collection('post').orderBy('time', 'desc');// entro a  databease a collection en post y ledigo orderby que es para ordenar por hora y de el mas reciente la otro
      postRef.get()// con .get le dice traelos
        .then(element => {// despues has esto
          let result = '';
          element.forEach(post => { // recorre todas las publicaciones para ponerlas
            if (currentUserID === post.data().userID) { // si el currentUserID es igual al userID pon el bote de bausro y los elementos
              result += `<div class="card mb-4 border-secondary">
            <div class="card-body">
              <p class="card-text" id="${post.id}">${post.data().content}</p>
            </div><div class="card-header small-font"><div class="container"><div class="row"><div class="col-md-8"><div class="row"><div class="col-md-2 px-0 px-md-2 col-2"><img src="${post.data().userPhoto}" class="rounded-circle profile-image"></div><div class="col-10 col-md-10 pl-0"><strong>${post.data().userName}</strong><p>${post.data().time}</p></div></div></div><div class="col-md-4 text-md-right text-center">${post.data().likes.length} <button class="no-btn mr-4" onclick="addLikeToPost('${post.id}')"><i class="fas fa-thumbs-up"></i></button>
            <button class="no-btn" onclick="deletePost('${post.id}')"><i class="far fa-trash-alt"></i></button><button class="no-btn" onclick="createUpdateArea('${post.id}')"><i class="ml-3 fas fa-pencil-alt"></i></button></div></div></div>
            </div>
            <div class="card-footer"><textarea id="comment-content" class="form-control form-textarea textarea-comment" placeholder="Escribe una comentario"></textarea><div class="text-right"><button class="btn btn-warning mt-2 btn-comment" onclick="addCommentToPost('${post.id}')" title="Guardar cambios"><i class="fas fa-location-arrow"></i></button></div></div>
          </div>`;
              drawCommentByPost(post.id);// si no pon esto sin los iconos
            } else {
              result += `<div class="card mb-4 border-secondary">
            <div class="card-body">
              <p class="card-text" id="${post.id}">${post.data().content}</p>
            </div><div class="card-header small-font"><div class="container"><div class="row"><div class="col-md-8"><div class="row"><div class="col-md-2 px-0 px-md-2 col-2"><img src="${post.data().userPhoto}" class="rounded-circle profile-image"></div><div class="col-10 col-md-10 pl-0"><strong>${post.data().userName}</strong><p>${post.data().time}</p></div></div></div><div class="col-md-4 text-md-right text-center">${post.data().likes.length} <button class="no-btn mr-4" onclick="addLikeToPost('${post.id}')"><i class="fas fa-thumbs-up"></i></button></div></div></div>
            </div>
            <div class="card-footer"><textarea id="comment${post.id}" class="form-control form-textarea textarea-comment" placeholder="Escribe una comentario"></textarea><div class="text-right"><button class="btn btn-warning mt-2 btn-comment" onclick="addCommentToPost('${post.id}')" title="Publicar comentario"><i class="fas fa-location-arrow"></i></button></div><div id="comment-area${post.id}"></div></div>
          </div>`;
              drawCommentByPost(post.id);
            }
          });
          document.getElementById('list-of-post').innerHTML = result;
        });
    } else {
      location.href = ('../index.html');// si no regresa a la pagina de incio
    }
  });
};

const checkUserIDforLike = (userID, likes) => { // verifica si esta le id o no
  const positionUserID = likes.indexOf(userID);
  if (positionUserID === -1) {
    return true;// significa que no esta
  } else {
    return positionUserID;// si esta dime cual es su posicion
  }
};
// para verificar
const addLikeToPost = (postID) => {
  firebase.auth().onAuthStateChanged(user => {
    if (user) { // si el usuario esta activo
      const currentUserID = user.uid; // guarda su id
      db.collection('post').doc(postID).get()
        .then(post => { // despues
          let currentUserLikes = post.data().likes;// entra a la parte de likes donde esta vacio []
          const checkUserLike = checkUserIDforLike(currentUserID, post.data().likes);// comprobar si ya dio like o no en la funcion de arriba
          if (checkUserLike === true) {// si es verdad metelo en donde esta currenID
            currentUserLikes.push(`${currentUserID}`); // con push lo agrega
            db.collection('post').doc(postID).update({ // update es para actualizar
              likes: currentUserLikes
            }).then(element => {
              drawPostByUser(); // luego dibujalo
            }).catch(element => { // si esta mal marca el error
              console.log('Error al aumentar contador de likes');
            });
          } else {
            currentUserLikes.splice(checkUserLike, 1); // lo corta y solo corta uno
            db.collection('post').doc(postID).update({ // cuando pase eso actualiza
              likes: currentUserLikes
            }).then(element => { // despues dibujalo con la funcion de drawPostByUser
              drawPostByUser();
            }).catch(element => {
              console.log('Error al aumentar contador de likes');
            });
          }
        });
    } else {
      location.href = ('../index.html');// si no redireccionalo a la pagina de incio
    }
  });
};

const drawCommentByPost = (postID) => { // dibujar todas las publicaciones se repite cada vez que impirme un post
  let result = '';
  db.collection('comment').get()// entra al db a comment y traelos
    .then(commentResult => {
      commentResult.forEach(element => { // recorrelo
        if (element.data().postID === postID) { // si es el mismo  pintalo es para tener una union en las publicaciones y coemntarlo
          result += `<div class="card-footer card-comment">
        <div class="small-font"><div class="container-fluid"><div class="row"><div class="col-md-2 col-2 px-0 px-md-2 text-center middle-aling"><img src="${element.data().userPhoto}" class="rounded-circle profile-small-image align-middle"></div><div class="col-md-10">${element.data().content}<p class="little-font"><strong>${element.data().userName} - ${element.data().time}</strong><p></div></div></div></div>
            </div>`;
        }
      });
      document.getElementById(`comment-area${postID}`).innerHTML = result;
    });
};

const addCommentToPost = (postID) => { // para crear y agregar el cometario al post , solo agrega la funcion para guardar
  let currentUserName = '';
  const commentContent = document.getElementById(`comment${postID}`).value; // agarra el valor que se escribe en donde estal part e del comentario
  console.log(commentContent);
  firebase.auth().onAuthStateChanged(user => { // observador
    if (user) {
      if (user.photoURL === null) { // lo mismo de la imagen que para el post
        userPhotoLink = '../images/user-default2.jpg';
      } else {
        userPhotoLink = user.photoURL;
      }
      let dateComment = firebase.firestore.FieldValue.serverTimestamp(); // para jalar la fecha
      if (user.displayName === null) {
        db.collection('users').get()
          .then(userResult => {
            userResult.forEach(element => {//  nombre dado
              if (element.data().userID === user.uid) {
                currentUserName = element.data().userName;
              }
            });
          });
      } else {
        currentUserName = user.displayName; // nombre existente
      }
      db.collection('comment').add({ // entra al database a la colecciones y agrega
        content: commentContent,
        postID: postID,
        userID: user.uid,
        userName: currentUserName,
        userPhoto: userPhotoLink,
        time: dateComment
      })
        .then(result => {
          swal({
            confirmButtonText: 'Aceptar',
            type: 'success',
            title: 'Comentario existoso'
          });
          drawPostByUser();
        })
        .catch(error => {
          console.log('Error en comentario', error);
        });
    }
  });
};
const deletePost = (postID) => { // para borrar el post
  swal({ // ventanita emergente
    title: '¿Estas seguro de eliminar la publicación?',
    type: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ffc107',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Aceptar'
  }).then(confirm => {
    if (confirm.value) { // si pone aceptar
      db.collection('post').doc(postID).delete() // metete y borralo
        .then(element => { // despues uan ventanita que diga que se borro correctamente
          swal({
            confirmButtonText: 'Aceptar',
            type: 'success',
            title: 'Publicación eliminada'
          });
          drawPostByUser();// y vuelve a pintar todo
        }).catch(element => {
          swal({
            confirmButtonText: 'Aceptar',
            type: 'error',
            title: 'Error al eliminar la publicación',
            text: 'Inténtalo de nuevo'
          });
        });
    }
  });
};

const createUpdateArea = postID => {// editar contenido
  db.collection('post').doc(postID).get() // para traer el contenido y se pueda editar
    .then(post => {
      document.getElementById(postID).innerHTML = `<textarea class="form-control form-textarea" id="post${postID}" rows="4">${post.data().content}</textarea><div class="ml-auto text-right"><button class="btn btn-warning" onclick="updatePostContent('${postID}')"><i class="fas fa-save"></i></button><div>`;
    }).catch(error => {
      console.log('Error al editar');
    });
};

const updatePostContent = postID => { // esta es para mandar lo que se escribio en la base de datos
  const postContent = document.getElementById(`post${postID}`).value;
  db.collection('post').doc(postID).get()
    .then(post => {
      db.collection('post').doc(postID).update({
        content: postContent
      }).then(element => {
        drawPostByUser();
      }).catch(element => {
        console.log('Error al editar la publicación');
      });
    });
};

getCurrentUserData();
drawPostByUser();
