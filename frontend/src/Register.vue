<template>
  <div class="vh-100 vw-100" :style="{'background-image': `url(${require('@/assets/event3.jpg')})`, 'background-repeat':'repeat', 'background-attachment':'fixed', 'background-position':'center top', 'background-size':'cover', 'paddingTop': '30px'}">
    <div class="container" style="margin-top: 50px">
      <div id="form" class="row justify-content-center" style="margin-left: 200px">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">Register</div>
            <div class="card-body">

              <div class="form-group">
                <label for="email" class="cols-sm-2 control-label">First name</label>
                <div class="cols-sm-10">
                  <div class="input-group">
                    <input type="text" class="form-control" id="firstname" placeholder="Enter first name" v-model="firstName">
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="email" class="cols-sm-2 control-label">Last name</label>
                <div class="cols-sm-10">
                  <div class="input-group">
                    <input type="text" class="form-control" id="lastname" placeholder="Enter last name" v-model="lastName">
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="email" class="cols-sm-2 control-label">Email address</label>
                <div class="cols-sm-10">
                  <div class="input-group">
                    <input type="email" class="form-control" id="email" aria-describedby="emailHelp" placeholder="Enter email" v-model="email">
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="password" class="cols-sm-2 control-label">Password</label>
                <div class="cols-sm-10">
                  <div class="input-group">
                    <input type="password" class="form-control" id="password" placeholder="Enter password" v-model="password">
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="input-group">
                  <div class="custom-file">
                    <input type="file" class="custom-file-input" id="userImage" accept="image/*" @change="onFileSelected">
                    <label class="custom-file-label" for="userImage" v-if="selectedImage!==undefined">{{ selectedImage.name }}</label>
                    <label class="custom-file-label" for="userImage" v-else>Choose a profile picture</label>
                  </div>
                </div>
              </div>
              <div style="margin-top: 10px" >
                <button type="button" class="btn btn-outline-success my-2 my-sm-0" @click="register()">Register</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="alert" v-if="showError" style="padding-left: 500px; padding-right: 500px; margin-top: 150px">
      <div class="alert alert-danger" role="alert">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close" @click="showError=false">
          <span aria-hidden="true">&times;</span>
        </button>
        <strong>Oh no! Something went wrong!</strong> {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      selectedImage: undefined,
      errorMessage: '',
      showError: false

    }
  },
  mounted() {
    if (localStorage.token) {
      this.$router.push("/");
    }
  },
  methods: {
    emailCheck(email) {
      let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    },
    async register() {
      if (this.emailCheck(this.email) && this.password.length >= 8) {
        await axios.post('http://localhost:4941/api/v1/users/register', {firstName: this.firstName, lastName: this.lastName, email: this.email, password: this.password})
            .then((response) => {
              if (response.status === 201) {
                axios.post('http://localhost:4941/api/v1/users/login', {email: this.email, password: this.password})
                    .then((response) => {
                      localStorage.token = response.data["token"];
                      localStorage.userId = response.data["userId"];
                      localStorage.email = this.email;
                      this.uploadImg(response.data["userId"], response.data["token"]);
                      this.$router.go(0);
                    })
              }
            }, (error) => {
              if (error !== undefined) {
                this.errorMessage = "This email is already registered!";
                this.showError = true;
              }
            });
      } else {
        if (this.email.length === 0 && this.password.length === 0) {
          this.errorMessage = "Please type your email AND password to register!";
          this.showError = true;
        } else if (this.email.length === 0) {
          this.errorMessage = "Please type your email to register!";
          this.showError = true;
        } else if (this.password.length === 0) {
          this.errorMessage = "Please type your password to register!";
          this.showError = true;
        } else if (!this.emailCheck(this.email)) {
          this.errorMessage = "Please type a valid email!";
          this.showError = true;
        } else if (this.password.length < 8) {
          this.errorMessage = "Your password needs to have at least 8 characters!";
          this.showError = true;
        }
      }
    },
    onFileSelected(event) {
      this.selectedImage = event.target.files[0];
      console.log(this.selectedImage);
    },
    isImage(ext) {
      switch (ext.toLowerCase()) {
        case 'jpg':
        case 'gif':
        case 'jpeg':
        case 'png':
          return true;
      }
      return false;
    },
    async uploadImg(id, token) {
      if (this.selectedImage !== undefined) {
        const fileExt = this.selectedImage.name.split('.')[this.selectedImage.name.split('.').length-1]
        console.log(fileExt);
        if (this.isImage(fileExt)) {
          await axios.put('http://localhost:4941/api/v1/users/' + id + '/image', this.selectedImage, {headers: {'X-Authorization': token, 'Content-Type': this.selectedImage.type}})
              .then((response) => {
                if (response.status === 201 || response.status === 200) {
                  //Say upload is successful!
                } else {
                  //Check for potential errors
                }
              })
        } else {
          this.errorMessage = "Only JPEG, PNG, and GIF images are accepted!";
          this.showError = true;
        }
      }
    }
  }
}
</script>

<style scoped>
body {
  background-color: #302836;
}
#form {
  opacity: 0.90;
  transition: all 0.8s ease-in-out;
}
#form:hover {
  opacity: 1;
}

#alert {
  opacity: 0.75;
  transition: all 0.8s ease-in-out;
}
#alert:hover {
  opacity: 1;
}
</style>