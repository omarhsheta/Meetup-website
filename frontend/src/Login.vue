<template>
  <div class="vh-100 vw-100" :style="{'background-image': `url(${require('@/assets/event1.jpg')})`, 'background-repeat':'repeat', 'background-attachment':'fixed', 'background-position':'center top', 'background-size':'cover', 'paddingTop': '30px'}">
    <div class="container" style="margin-top: 50px">
      <div id="form" class="row justify-content-center" style="margin-left: 200px">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">Login</div>
            <div class="card-body">

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

              <button type="button" class="btn btn-outline-success my-2 my-sm-0" @click="login()">Login</button>
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
import 'bootstrap/dist/js/bootstrap.bundle';
// import app from './App';
import axios from 'axios';
export default {
  data() {
    return {
      error: "",
      errorFlag: false,
      email: '',
      password: '',
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
    login() {
      if (this.password !== '' && this.email !== '') {
        axios.post('http://localhost:4941/api/v1/users/login', {email: this.email, password: this.password})
            .then((response) => {
              if (response.status === 200) {
                localStorage.token = response.data["token"];
                localStorage.userId = response.data["userId"];
                localStorage.email = this.email;
                this.$router.go(0);
              } else {
                this.errorMessage = "The email/password you have entered is incorrect!";
                this.showError = true;
              }
            }).catch(() => {
          this.errorMessage = "The email/password you have entered is incorrect!";
          this.showError = true;
        })
      } else {
        this.errorMessage = "Please enter your email and password to login!";
        this.showError = true;
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
  opacity: 0.80;
  transition: all 0.8s ease-in-out;
}
#form:hover {
  opacity: 1;
}

#alert {
  opacity: 0.70;
  transition: all 0.8s ease-in-out;
}
#alert:hover {
  opacity: 1;
}
</style>