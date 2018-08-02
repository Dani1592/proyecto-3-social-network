document.getElementById('sign-out').addEventListener('click', event => {
  event.preventDefault();
  socialNetwork.signOut();
});

const setUserProfile = () => { // es la que pone la caja de donde esta el perfil 
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      let currentDogName = '';
      db.collection('users').get()
        .then(userResult => {
          userResult.forEach(element => {
            if (user.uid === element.data().userID) {
              document.getElementById('current-dog-name').innerHTML = `${element.data().dogName} - ${element.data().dogBreed}`;
              if (user.displayName === null) {
                if (element.data().userName !== null) {
                  document.getElementById('current-user-name').innerHTML = element.data().userName;
                } else {
                  document.getElementById('current-user-name').innerHTML = user.email;
                }
              } else {
                document.getElementById('current-user-name').innerHTML = user.displayName;
              }
            }
          });
        });
      userPhoto = document.getElementById('user-image');
      if (user.photoURL === null) {
        userPhoto.src = '../images/user-default2.jpg';
      } else {
        userPhoto.src = `${user.photoURL}?height=300`;
      }
    }
  });
};
