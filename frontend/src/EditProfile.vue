<template>
  <div class="vh-100 vw-100" :style="{'background-image': `url(${require('@/assets/event3.jpg')})`, 'background-repeat':'repeat', 'background-attachment':'fixed', 'background-position':'center top', 'background-size':'cover', 'paddingTop': '30px'}">
    <div id="form" class="container rounded bg-white mt-5 mb-5">
      <div class="row">
        <div class="col-md-3 border-right" v-if="imgFound">
          <div class="d-flex flex-column align-items-center text-center p-3 py-5"><img class="rounded-circle mt-5" :src="'http://localhost:4941/api/v1/users/'+userId+'/image'" width="250"><span class="font-weight-bold">{{firstName}} {{lastName}}</span><span class="text-black-50">{{ email }}</span><span> </span></div>
        </div>
        <div class="col-md-3 border-right" v-else>
          <div class="d-flex flex-column align-items-center text-center p-3 py-5"><img class="rounded-circle mt-5" src="@/assets/noprofilepic.png" width="300"><span class="font-weight-bold">{{firstName}} {{lastName}}</span><span class="text-black-50">{{ email }}</span><span> </span></div>
        </div>
        <div class="col-md-5 border-right">
          <div class="p-3 py-5">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="text-right">Profile Settings</h4>
            </div>
            <div class="row mt-2">
              <div class="col-md-6"><label class="labels">First Name</label><input type="text" class="form-control" placeholder="First name" v-model="newFirstName"></div>
              <div class="col-md-6"><label class="labels">Last Name</label><input type="text" class="form-control" placeholder="Last name" v-model="newLastName"></div>
            </div>
            <div class="row mt-3">
              <div class="col-md-12"><label class="labels">Email</label><input type="email" class="form-control" placeholder="Email" v-model="newEmail"></div>
            </div>
            <div class="row mt-3">
              <div class="col-md-12"><label class="labels">New Password</label><input type="password" class="form-control" placeholder="New Password" v-model="newPassword"></div>
            </div>
            <div class="row mt-3">
              <div class="col-md-12"><label class="labels">Current Password*</label><input type="password" class="form-control" placeholder="Current Password" v-model="curPassword"></div>
            </div>
            <div class="row mt-3" v-if="imgFound">
              <div class="form-check">
                <input type="checkbox" class="form-check-input" id="deleteImg" @click="deleteImg=!deleteImg">
                <label class="form-check-label" for="deleteImg">Delete profile pic</label>
              </div>
            </div>
            <div class="row mt-3">
              <div class="input-group">
                <div class="custom-file">
                  <input type="file" class="custom-file-input" id="userImage" @change="onFileSelected">
                  <label class="custom-file-label" for="userImage" v-if="selectedImage!==undefined">{{ selectedImage.name }}</label>
                  <label class="custom-file-label" for="userImage" v-else>Choose file</label>
                </div>
              </div>
            </div>
            <div class="mt-5 text-center"><button class="btn btn-primary profile-button" type="button" @click="submitChange">Change Profile</button></div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showError" style="padding-left: 500px; padding-right: 500px; margin-top: 150px">
      <div id="alert" class="alert alert-danger" role="alert">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close" @click="showError=false">
          <span aria-hidden="true">&times;</span>
        </button>
        <strong>Oh no! Something went wrong!</strong> {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      userId: localStorage.userId,
      firstName: localStorage.firstName,
      lastName: localStorage.lastName,
      email: localStorage.email,
      token: localStorage.token,
      newFirstName: "",
      newLastName: "",
      newEmail: "",
      newPassword: "",
      curPassword: "",
      selectedImage: undefined,
      deleteImg: false,
      imgFound: false,
      errorMessage: '',
      showError: false
    }
  },
  mounted() {
    this.getImage();
  },
  methods: {
    onFileSelected(event) {
      this.selectedImage = event.target.files[0];
    },
    emailCheck(email) {
      let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    },
    changeDetails() {
      const payload = {
        firstName: this.newFirstName,
        lastName: this.newLastName,
        email: this.newEmail,
        password: this.newPassword,
        currentPassword: this.curPassword
      }
      axios.patch(`http://localhost:4941/api/v1/users/${this.userId}`, payload, {headers: {'X-Authorization': localStorage.token, 'Content-Type': 'application/json'}}).then((response) => {
        if (response.status === 200) {
          localStorage.firstName = this.newFirstName
          localStorage.lastName = this.newLastName
          localStorage.email = this.newEmail
          if (this.deleteImg) {
            this.deleteImage();
            this.$router.go();
          } else if (this.selectedImage !== undefined) {
            this.uploadImg();
            this.$router.go();
          } else {
            this.$router.go();
          }
        }
      }, (error) => {
        if (error.response.statusText.includes("password")) {
          this.errorMessage = "Incorrect password!";
          this.showError = true;
        }
        if (error.response.statusText.includes("email")) {
          this.errorMessage = "Email is already in use!";
          this.showError = true;
        }
      });
    },
    deleteImage() {
      axios.delete(`http://localhost:4941/api/v1/users/${this.userId}/image`, {headers: {'X-Authorization': localStorage.token}})
          .then((response) => {
            if (response.status === 200) {
              console.log("Image deleted successfully!");
            }
      })
    },
    isImage(ext) {
      switch (ext.toLowerCase()) {
        case 'jpg':
        case 'gif':
        case 'jpeg':
        case 'png':
          //etc
          return true;
      }
      return false;
    },
    uploadImg() {
      const fileExt = this.selectedImage.name.split('.')[this.selectedImage.name.split('.').length-1]
      if (this.isImage(fileExt)) {
        axios.put('http://localhost:4941/api/v1/users/' + this.userId + '/image', this.selectedImage, {headers: {'X-Authorization': this.token, 'Content-Type': this.selectedImage.type}})
            .then((response) => {
              if (response.status === 201 || response.status === 200) {
                //Say upload is successful!
              }
            })
      } else {
        //Show modal for invalid file format
        this.errorMessage = "Only JPEG, PNG, and GIF images are accepted!";
        this.showError = true;
      }
    },
    submitChange() {
      if (!this.emailCheck(this.newEmail) && this.newEmail.length > 0) {
        this.errorMessage = "Nope, bad email";
        this.showError = true;
      } else if (this.curPassword.length === 0) {
        this.errorMessage = "Please enter your password";
        this.showError = true;
      } else {
        if (this.newFirstName.length === 0) {
          this.newFirstName = localStorage.firstName;
        }
        if (this.newLastName.length === 0) {
          this.newLastName = localStorage.lastName;
        }
        if (this.newEmail.length === 0) {
          this.newEmail = localStorage.email;
        }
        if (this.newPassword.length === 0) {
          this.newPassword = this.curPassword;
        }
        if (this.newFirstName.length > 0 || this.newLastName.length > 0 || this.newEmail > 0 || this.newPassword > 0) {
          this.changeDetails();
        } else {
          if (this.deleteImg) {
            this.deleteImage();
            this.$router.go();
          } else if (this.selectedImage !== undefined) {
            this.uploadImg();
            this.$router.go();
          } else {
            this.$router.go();
          }
        }
      }
    },
    getImage() {
      axios.get(`http://localhost:4941/api/v1/users/${this.userId}/image`).then((response) => {
        if (response.status === 200) {
          this.imgFound = true;
        }
      });
    }
  }
}
</script>

<style scoped>
body {
  background-color: #302836;
}

.form-control:focus {
  box-shadow: none;
  border-color: #BA68C8
}

.profile-button {
  background: rgb(99, 39, 120);
  box-shadow: none;
  border: none
}

.profile-button:hover {
  background: #682773
}

.profile-button:focus {
  background: #682773;
  box-shadow: none
}

.profile-button:active {
  background: #682773;
  box-shadow: none
}

.back:hover {
  color: #682773;
  cursor: pointer
}

.labels {
  font-size: 11px
}

.add-experience:hover {
  background: #BA68C8;
  color: #fff;
  cursor: pointer;
  border: solid 1px #BA68C8
}

#form {
  opacity: 0.80;
  transition: all 0.8s ease-in-out;
}
#form:hover {
  opacity: 1;
}

#form {
  opacity: 0.95;
  transition: all 0.8s ease-in-out;
}
#form:hover {
  opacity: 1;
}

#alert {
  opacity: 0.80;
  transition: all 0.8s ease-in-out;
}
#alert:hover {
  opacity: 1;
}
</style>