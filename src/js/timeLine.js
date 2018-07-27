
socialNetwork.initializeFirebase();
let db = firebase.firestore();

document.getElementById('sign-out').addEventListener('click', event => {
  event.preventDefault();
  socialNetwork.signOut();
});


const setUserProfile = user => {
  if(user.displayName === null){
    document.getElementById('current-user-name').innerHTML = user.email;
  }else{
    document.getElementById('current-user-name').innerHTML = user.displayName;
  }
  document.getElementById('current-user-email').innerHTML = user.email;
  userPhoto = document.getElementById('user-image');
  if (user.photoURL === null) {
    userPhoto.src = '../images/user-default2.jpg';
  } else {
    userPhoto.src = `${user.photoURL}?height=300`;
  }
};

const getCurrentUserData = () => {
  let userPhotoLink;
  let currentName;
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      setUserProfile(user);
      document.getElementById('send-post').addEventListener('click', event => {
        event.preventDefault();
        let datePost = firebase.firestore.FieldValue.serverTimestamp();
        const contentPost = document.getElementById('user-content-post').value;
        if (user.photoURL === null) {
          userPhotoLink = '../images/user-default2.jpg';
        } else {
          userPhotoLink = user.photoURL;
        }

        if(user.displayName === null){
          currentName = user.email;
        }else{
          currentName = user.displayName;
        }
        db.collection('post').add({
          userID: user.uid,
          userName: currentName,
          userPhoto: userPhotoLink,
          time: datePost,
          likes: [],
          content: contentPost
        }).then(result => {
          swal({
            confirmButtonText: 'Aceptar',
            type: 'success',
            title: 'Publicación exitosa'
          });
          document.getElementById('user-content-post').value = '';
          drawPostByUser();
        }).catch(error => {
          console.error('Error adding document: ', error);
        });
      });
    } else {
      location.href = ('../index.html');
    }
  });
};

const drawPostByUser = () => {
  firebase.auth().onAuthStateChanged(user => {
    if(user){
      const currentUserID = user.uid;
      const postRef = db.collection('post').orderBy('time', 'desc');
      postRef.get()
      .then(element => {
        let result = '';
        element.forEach(post => {
          if(currentUserID === post.data().userID){
            result += `<div class="card mb-4 border-secondary">
            <div class="card-body">
              <p class="card-text" id="${post.id}">${post.data().content}</p>
            </div><div class="card-header small-font"><div class="container"><div class="row"><div class="col-md-8"><div class="row"><div class="col-md-2 px-0 px-md-2 col-2"><img src="${post.data().userPhoto}" class="rounded-circle profile-image"></div><div class="col-10 col-md-10 pl-0"><strong>${post.data().userName}</strong><p>${post.data().time}</p></div></div></div><div class="col-md-4 text-md-right text-center">${post.data().likes.length} <button class="no-btn mr-4" onclick="addLikeToPost('${post.id}')"><i class="fas fa-thumbs-up"></i></button>
            <button class="no-btn" onclick="deletePost('${post.id}')"><i class="far fa-trash-alt"></i></button><button class="no-btn" onclick="createUpdateArea('${post.id}')"><i class="ml-3 fas fa-pencil-alt"></i></button></div></div></div>
            </div>
          </div>`;
          }else{
            result += `<div class="card mb-4 border-secondary">
            <div class="card-body">
              <p class="card-text" id="${post.id}">${post.data().content}</p>
            </div><div class="card-header small-font"><div class="container"><div class="row"><div class="col-md-8"><div class="row"><div class="col-md-2 px-0 px-md-2 col-2"><img src="${post.data().userPhoto}" class="rounded-circle profile-image"></div><div class="col-10 col-md-10 pl-0"><strong>${post.data().userName}</strong><p>${post.data().time}</p></div></div></div><div class="col-md-4 text-md-right text-center">${post.data().likes.length} <button class="no-btn mr-4" onclick="addLikeToPost('${post.id}')"><i class="fas fa-thumbs-up"></i></button></div></div></div>
            </div>
          </div>`;
          }
        });
        document.getElementById('list-of-post').innerHTML = result;
      });
    }else{
      location.href = ('../index.html');
    }
  });
};

const checkUserIDforLike = (userID, likes) =>{
  let exist = 0;
  likes.forEach(element =>{
    if(element === userID){
      exist+=1;
    }
  })
  if(exist >= 1){
    return exist;
  }else{
    return false;
  }
}

const addLikeToPost = (postID) => {
  firebase.auth().onAuthStateChanged(user => {
    if(user){
      const currentUserID = user.uid;
      db.collection('post').doc(postID).get()
      .then(post => {
        let currentUserLikes = post.data().likes;
        const checkUserLike = checkUserIDforLike(currentUserID,post.data().likes);
        if(!checkUserLike){
          currentUserLikes.push(`${currentUserID}`);
          db.collection('post').doc(postID).update({
            likes: currentUserLikes
            }).then(element => {
              drawPostByUser();
            }).catch(element => {
              console.log('Error al aumentar contador de likes');
          });
        }else{
          console.log(checkUserLike);
          //currentUserLikes.splice();

        }
      });
    }else{
      location.href = ('../index.html');
    }
  });  
};



const deletePost = (postID) => {
  swal({
    title: '¿Estas seguro de eliminar la publicación?',
    type: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ffc107',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Aceptar'
  }).then(confirm => {
    if (confirm.value) {
      db.collection('post').doc(postID).delete()
        .then(element => {
          swal({
            confirmButtonText: 'Aceptar',
            type: 'success',
            title: 'Publicación eliminada'
          });
          drawPostByUser();
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

const createUpdateArea = postID => {
  db.collection('post').doc(postID).get()
    .then(post => {
      document.getElementById(postID).innerHTML = `<textarea class="form-control form-textarea" id="post${postID}" rows="4">${post.data().content}</textarea><div class="ml-auto text-right"><button class="btn btn-warning" onclick="updatePostContent('${postID}')"><i class="fas fa-save"></i></button><div>`;
    }).catch(error => {
      console.log('Error al editar');
    });
};

const updatePostContent = postID => {
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